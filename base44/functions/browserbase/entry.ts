import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  GUARDRAILS,
  NOT_CONNECTED,
  actionExists,
  actionSummary,
  hostCall,
  hostConfigured,
  ensureHost,
  hostSource,
  hostUrl,
  isDestructive,
  listActions,
  signedFrameUrl,
} from '../../shared/browserHost.ts';
import { advanceRun } from '../../shared/browserAgentLoop.ts';
import { recordAudit, recordRun, recordSession, recordUsage } from '../../shared/hostStore.ts';

function objectOrNull(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

async function touchSession(base44, sessionId, patch) {
  if (!sessionId) return null;
  const { items } = await base44.entities.BrowserSession.filter(
    { session_id: String(sessionId) },
    { sort: '-created_date', limit: 1 }
  );
  if (!items.length) return null;
  return base44.entities.BrowserSession.update(items[0].id, patch);
}

async function runRecord(base44, runId) {
  const { items } = await base44.entities.BrowserRun.filter({ run_id: String(runId) }, { sort: '-created_date', limit: 1 });
  return items[0] || null;
}

function runView(record) {
  return {
    id: record.run_id,
    status: record.status,
    task: record.task,
    agent_id: record.agent_id,
    agent_name: record.agent_name,
    session_id: record.session_id,
    output: record.output || null,
    urls: record.urls || [],
    steps: record.steps || [],
    error: record.error || null,
    started_at: record.started_at,
    ended_at: record.ended_at,
  };
}

async function agentActions(base44, action, params) {
  if (action === 'agents.list') {
    const { items } = await base44.entities.BrowserAgent.list('-created_date', Math.min(50, Number(params.limit) || 50));
    return {
      ok: true,
      data: items.map((item) => ({
        agentId: item.agent_id,
        name: item.name,
        systemPrompt: item.system_prompt,
        resultSchema: item.result_schema,
        runs: item.runs_count || 0,
      })),
    };
  }

  if (action === 'agents.create') {
    if (!params.name) return { ok: false, error: 'name is required', status: 400 };
    const record = await base44.entities.BrowserAgent.create({
      agent_id: crypto.randomUUID(),
      name: String(params.name),
      system_prompt: params.system_prompt ? String(params.system_prompt) : undefined,
      result_schema: objectOrNull(params.result_schema),
      notes: 'Stored on this app and run by its own engine',
    });
    return { ok: true, data: { agentId: record.agent_id, name: record.name }, record };
  }

  if (!params.agent_id) return { ok: false, error: 'agent_id is required', status: 400 };
  const { items } = await base44.entities.BrowserAgent.filter({ agent_id: String(params.agent_id) }, { limit: 1 });
  if (!items.length) return { ok: false, error: 'No agent with that id', status: 404 };
  const agent = items[0];

  if (action === 'agents.get') {
    return { ok: true, data: { agentId: agent.agent_id, name: agent.name, systemPrompt: agent.system_prompt, resultSchema: agent.result_schema } };
  }

  if (action === 'agents.update') {
    const record = await base44.entities.BrowserAgent.update(agent.id, {
      name: params.name ? String(params.name) : undefined,
      system_prompt: params.system_prompt ? String(params.system_prompt) : undefined,
      result_schema: objectOrNull(params.result_schema),
    });
    return { ok: true, data: { agentId: record.agent_id, name: record.name }, record };
  }

  if (action === 'agents.delete') {
    await base44.entities.BrowserAgent.delete(agent.id);
    return { ok: true, data: { deleted: agent.agent_id } };
  }

  return { ok: false, error: 'Unsupported agent action', status: 400 };
}

async function runActions(base44, action, params) {
  if (action === 'runs.create') {
    if (!params.task) return { ok: false, error: 'task is required', status: 400 };
    if (!hostConfigured()) return { ok: false, error: NOT_CONNECTED, status: 503 };
    let agent = null;
    if (params.agent_id) {
      const { items } = await base44.entities.BrowserAgent.filter({ agent_id: String(params.agent_id) }, { limit: 1 });
      agent = items[0] || null;
    }
    const runId = crypto.randomUUID();
    const now = new Date().toISOString();
    const record = await base44.entities.BrowserRun.create({
      run_id: runId,
      agent_id: agent ? agent.agent_id : undefined,
      agent_name: agent ? agent.name : undefined,
      task: String(params.task),
      status: 'RUNNING',
      started_at: now,
      steps: [{ at: now, kind: 'task', text: String(params.task).slice(0, 600) }],
      webhook_state: 'in-app',
    });
    if (agent) {
      await base44.entities.BrowserAgent.update(agent.id, {
        runs_count: (agent.runs_count || 0) + 1,
        last_run_id: runId,
      });
    }
    return { ok: true, data: runView(record), record };
  }

  if (action === 'runs.list') {
    const query = {};
    if (params.status) query.status = String(params.status).toUpperCase();
    const page = await base44.entities.BrowserRun.filter(query, {
      sort: '-created_date',
      limit: Math.min(50, Number(params.limit) || 20),
    });
    return { ok: true, data: page.items.map(runView) };
  }

  if (!params.run_id) return { ok: false, error: 'run_id is required', status: 400 };
  const record = await runRecord(base44, params.run_id);
  if (!record) return { ok: false, error: 'No run with that id', status: 404 };

  if (action === 'runs.stop') {
    const stopped = await base44.entities.BrowserRun.update(record.id, {
      status: 'STOPPED',
      ended_at: new Date().toISOString(),
    });
    return { ok: true, data: runView(stopped), record: stopped };
  }

  if (action === 'runs.resume') {
    const resumed = await base44.entities.BrowserRun.update(record.id, { status: 'RUNNING', error: null, ended_at: null });
    return { ok: true, data: runView(resumed), record: resumed };
  }

  if (action === 'runs.messages') {
    return { ok: true, data: record.steps || [] };
  }

  if (action === 'runs.files') {
    return { ok: true, data: [] };
  }

  if (action === 'runs.get') {
    if (record.status !== 'RUNNING') return { ok: true, data: runView(record), record };
    if (!hostConfigured()) return { ok: false, error: NOT_CONNECTED, status: 503, data: runView(record) };
    let agent = null;
    if (record.agent_id) {
      const { items } = await base44.entities.BrowserAgent.filter({ agent_id: record.agent_id }, { limit: 1 });
      agent = items[0] || null;
    }
    const advanced = await advanceRun(base44, record, agent);
    await recordRun({
      id: advanced.run_id,
      session_id: advanced.session_id,
      agent_id: advanced.agent_id,
      task: advanced.task,
      status: advanced.status,
      output: advanced.output,
      steps: advanced.steps,
      error: advanced.error,
      started_at: advanced.started_at,
      ended_at: advanced.ended_at,
    });
    return { ok: true, data: runView(advanced), record: advanced };
  }

  return { ok: false, error: 'Unsupported run action', status: 400 };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

    const payload = await req.json().catch(() => ({}));
    const action = payload.action;
    const params = objectOrNull(payload.params) || {};
    const started = Date.now();

    await ensureHost();

    if (action === 'registry.list') {
      return Response.json({
        ok: true,
        action,
        data: listActions(),
        guardrails: GUARDRAILS,
        host_configured: hostConfigured(),
        host_url: hostUrl(),
        host_source: hostSource(),
      });
    }

    if (action === 'host.status') {
      if (!hostConfigured()) return Response.json({ ok: false, action, error: NOT_CONNECTED, status: 503 });
      const health = await hostCall('usage.get', {});
      return Response.json({ ok: health.ok, action, data: health.data, error: health.error, status: health.status });
    }

    if (!action || !actionExists(action)) {
      return Response.json(
        { error: 'Unknown action', actions: listActions().map((item) => item.name) },
        { status: 400 }
      );
    }

    if (!hostConfigured() && !action.startsWith('agents.')) {
      return Response.json({ ok: false, action, error: NOT_CONNECTED, status: 503 }, { status: 503 });
    }

    if (isDestructive(action) && payload.confirm !== true) {
      return Response.json(
        { ok: false, action, needs_confirmation: true, summary: actionSummary(action) },
        { status: 409 }
      );
    }

    if (action.startsWith('agents.')) {
      const local = await agentActions(base44, action, params);
      return Response.json({ ...local, action, ms: Date.now() - started }, { status: local.ok ? 200 : local.status || 400 });
    }

    if (action.startsWith('runs.')) {
      const local = await runActions(base44, action, params);
      return Response.json({ ...local, action, ms: Date.now() - started }, { status: local.ok ? 200 : local.status || 400 });
    }

    if (action === 'sessions.create') {
      const running = await hostCall('sessions.list', { status: 'RUNNING', limit: 50 });
      const active = running.ok && Array.isArray(running.data) ? running.data.length : 0;
      if (active >= GUARDRAILS.maxConcurrentSessions) {
        return Response.json(
          {
            ok: false,
            action,
            error: `${active} sessions are already running on your host and the limit is ${GUARDRAILS.maxConcurrentSessions}. Release one first.`,
          },
          { status: 429 }
        );
      }
    }

    const result = await hostCall(action, params);
    const data = objectOrNull(result.data) || {};
    const now = new Date().toISOString();
    let saved = null;

    if (result.ok && action === 'sessions.create' && data.id) {
      let liveUrl = null;
      try {
        liveUrl = await signedFrameUrl(String(data.id));
      } catch {
        liveUrl = null;
      }
      saved = await base44.entities.BrowserSession.create({
        session_id: String(data.id),
        status: data.status || 'RUNNING',
        live_url: liveUrl || undefined,
        region: undefined,
        timeout_seconds: Number(data.timeout_seconds) || GUARDRAILS.maxSessionSeconds,
        keep_alive: Boolean(data.keep_alive),
        started_at: data.started_at || now,
        last_action: action,
        last_status: result.status,
        action_count: 1,
        note: data.context_id ? `context ${data.context_id}` : undefined,
      });
    }

    if (action === 'usage.get' && result.ok && data.browserMinutes !== undefined) {
      saved = null;
    }

    if (params.session_id && action !== 'sessions.create') {
      const patch = { last_action: action, last_status: result.status };
      if (action === 'sessions.release' && result.ok) {
        patch.status = 'COMPLETED';
        patch.ended_at = now;
      }
      saved = (await touchSession(base44, params.session_id, patch)) || saved;
    }

    if (result.ok && action === 'sessions.create' && data.id) {
      await recordSession({
        id: data.id,
        status: data.status || 'RUNNING',
        context_id: data.context_id,
        started_at: data.started_at || now,
        meta: { keep_alive: Boolean(data.keep_alive), timeout_seconds: Number(data.timeout_seconds) || null },
      });
    }

    if (action === 'usage.get' && result.ok && data.browserMinutes !== undefined) {
      await recordUsage({
        minutes: data.browserMinutes,
        sessions: data.sessionsOpened,
        actions: data.pageActions,
      });
    }

    await recordAudit({
      action,
      target: params.session_id || params.run_id || params.agent_id || null,
      ok: Boolean(result.ok),
      detail: { status: result.status, ms: Date.now() - started, error: result.error || null },
    });

    return Response.json({ ...result, record: saved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}