import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  GUARDRAILS,
  actionExists,
  actionSummary,
  bbRequest,
  isDestructive,
  listActions,
} from '../../shared/browserbase.ts';

async function touchSession(base44, sessionId, patch) {
  if (!sessionId) return null;
  const { items } = await base44.entities.BrowserSession.filter(
    { session_id: String(sessionId) },
    { sort: '-created_date', limit: 1 }
  );
  if (!items.length) return null;
  return base44.entities.BrowserSession.update(items[0].id, patch);
}

async function touchRun(base44, runId, patch) {
  if (!runId) return null;
  const { items } = await base44.entities.BrowserRun.filter(
    { run_id: String(runId) },
    { sort: '-created_date', limit: 1 }
  );
  if (!items.length) return null;
  return base44.entities.BrowserRun.update(items[0].id, patch);
}

function objectOrNull(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
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

    if (action === 'registry.list') {
      return Response.json({ ok: true, action, data: listActions(), guardrails: GUARDRAILS });
    }

    if (!action || !actionExists(action)) {
      return Response.json(
        { error: 'Unknown action', actions: listActions().map((item) => item.name) },
        { status: 400 }
      );
    }

    if (isDestructive(action) && payload.confirm !== true) {
      return Response.json(
        { ok: false, action, needs_confirmation: true, summary: actionSummary(action) },
        { status: 409 }
      );
    }

    if (action === 'sessions.create') {
      const running = await bbRequest('sessions.list', { status: 'RUNNING', limit: 50 });
      const active = running.ok && Array.isArray(running.data) ? running.data.length : 0;
      if (active >= GUARDRAILS.maxConcurrentSessions) {
        return Response.json(
          {
            ok: false,
            action,
            error: `${active} sessions are already running and the limit is ${GUARDRAILS.maxConcurrentSessions}. Release one first.`,
          },
          { status: 429 }
        );
      }
    }

    const result = await bbRequest(action, params);
    const data = objectOrNull(result.data) || {};
    const now = new Date().toISOString();
    let saved = null;

    if (result.ok && action === 'sessions.create' && data.id) {
      saved = await base44.entities.BrowserSession.create({
        session_id: String(data.id),
        status: data.status || 'CREATED',
        live_url: data.debuggerFullscreenUrl || undefined,
        debugger_url: data.debuggerUrl || undefined,
        connect_url: data.connectUrl || undefined,
        region: data.region || params.region || undefined,
        timeout_seconds: Number(data.timeout) || GUARDRAILS.maxSessionSeconds,
        keep_alive: Boolean(data.keepAlive),
        started_at: now,
        last_action: action,
        last_status: result.status,
        action_count: 1,
      });
    }

    if (result.ok && action === 'agents.create' && (data.agentId || data.id)) {
      saved = await base44.entities.BrowserAgent.create({
        agent_id: String(data.agentId || data.id),
        name: data.name || params.name || 'Untitled agent',
        system_prompt: data.systemPrompt || params.system_prompt || undefined,
        result_schema: objectOrNull(data.resultSchema) || objectOrNull(params.result_schema),
        notes: 'Created from the control plane',
      });
    }

    if (result.ok && action === 'agents.delete' && params.agent_id) {
      const { items } = await base44.entities.BrowserAgent.filter({ agent_id: String(params.agent_id) }, { limit: 5 });
      if (items.length) {
        await base44.entities.BrowserAgent.deleteMany({ agent_id: String(params.agent_id) });
        saved = { deleted: items.length };
      }
    }

    if (result.ok && action === 'runs.create' && (data.id || data.runId)) {
      saved = await base44.entities.BrowserRun.create({
        run_id: String(data.id || data.runId),
        agent_id: params.agent_id ? String(params.agent_id) : data.agentId ? String(data.agentId) : undefined,
        agent_name: data.agentName || undefined,
        task: String(params.task || ''),
        status: data.status || 'PENDING',
        session_id: data.sessionId ? String(data.sessionId) : undefined,
        started_at: now,
        webhook_state: 'awaiting',
        audit: [{ at: now, action, status: result.status, ok: true }],
      });
    }

    if (result.ok && (action === 'runs.get' || action === 'runs.resume' || action === 'runs.stop') && params.run_id) {
      const patch = {
        status: data.status || undefined,
        ended_at: data.endedAt || data.completedAt || undefined,
        error: data.error ? String(data.error).slice(0, 500) : undefined,
      };
      const output = objectOrNull(data.output) || objectOrNull(data.result);
      if (output) patch.output = output;
      saved = await touchRun(base44, params.run_id, patch);
    }

    if (action === 'runs.messages' && Array.isArray(data)) {
      const steps = data.slice(-40).map((item) => ({
        at: item.createdAt || item.at || now,
        kind: item.type || item.role || 'step',
        text: String(item.content || item.text || item.message || JSON.stringify(item).slice(0, 400)).slice(0, 800),
      }));
      saved = await touchRun(base44, params.run_id, { steps });
    }

    if (params.session_id && action !== 'sessions.create') {
      const patch = { last_action: action, last_status: result.status };
      if (action === 'sessions.release' && result.ok) {
        patch.status = 'REQUEST_RELEASE';
        patch.ended_at = now;
      }
      saved = (await touchSession(base44, params.session_id, patch)) || saved;
    }

    return Response.json({ ...result, record: saved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}