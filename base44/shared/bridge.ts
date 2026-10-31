// The X1 Operating System talks to X1 Apex Factory through one shared key. Every inbound call is
// POST /functions/x1Bridge with the key in the `x-x1-bridge-key` header (or `bridge_key` in the body),
// and only the actions listed in KEYED_ACTIONS are reachable — no generic passthrough, no arbitrary
// entity access, every result bounded.
import { createNativeTask } from './native.ts';

export const BRIDGE_SECRET = 'X1_BRIDGE_KEY';
export const BRIDGE_HEADER = 'x-x1-bridge-key';
// The outbound half: where the X1 Operating System answers its own bridge.
export const OS_URL_SECRET = 'X1_OS_BASE_URL';

export async function callOs(baseUrl: string, key: string, action: string, payload: any) {
  const url = `${baseUrl.replace(/\/$/, '')}/functions/x1Bridge`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', [BRIDGE_HEADER]: key },
    body: JSON.stringify({ ...payload, action }),
    signal: AbortSignal.timeout(25000),
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, url, body };
}

// OpenClaw answers an OpenAI-compatible gateway on the same host it serves its console from. That,
// not /functions/x1Bridge, is where a prompt is actually handed to that OS.
export const OS_CHAT_PATH = '/v1/chat/completions';

export async function chatOs(baseUrl: string, message: string, model?: string) {
  const root = baseUrl.replace(/\/$/, '');
  let chosen = String(model || '').trim();
  if (!chosen) {
    const listed = await fetch(`${root}/v1/models`, { signal: AbortSignal.timeout(10000) });
    const body = await listed.json().catch(() => null);
    chosen = body?.data?.[0]?.id || '';
  }
  if (!chosen) return { ok: false, status: 0, url: `${root}${OS_CHAT_PATH}`, body: { error: 'That OS lists no model on /v1/models.' } };
  const url = `${root}${OS_CHAT_PATH}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: chosen, messages: [{ role: 'user', content: message }], max_tokens: 1200 }),
    signal: AbortSignal.timeout(60000),
  });
  const body = await res.json().catch(() => null);
  return {
    ok: res.ok,
    status: res.status,
    url,
    body: res.ok
      ? { model: chosen, text: body?.choices?.[0]?.message?.content || '', raw_usage: body?.usage || null }
      : body || { error: `The gateway answered ${res.status}.` },
  };
}

export const KEYED_ACTIONS = {
  ping: 'Health check: the factory answers with its identity and the server time.',
  status: 'Live counts: tasks, running tasks, projects, templates, open findings, latest benchmark.',
  'task.list': 'The most recent studio tasks (limit ≤ 20, optional status filter).',
  'task.get': 'One task with its last 10 steps.',
  'task.create': 'Start a real studio run from an instruction (model, effort and project optional).',
  'finding.list': 'Open guardian findings (limit ≤ 20).',
};

export class BridgeError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const encoder = new TextEncoder();

async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(String(value)));
  return Array.from(new Uint8Array(bytes));
}

// Comparing digests in constant time means a wrong key never reveals how far it matched.
export async function keyMatches(configured: string, supplied: string) {
  if (!configured || !supplied) return false;
  const [a, b] = await Promise.all([digest(configured), digest(supplied)]);
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function readKey(req: any, body: any) {
  const header = req?.headers?.get?.(BRIDGE_HEADER) || '';
  const fromBody = typeof body?.bridge_key === 'string' ? body.bridge_key : '';
  return String(header || fromBody).trim();
}

const limitOf = (value: any, fallback: number, max: number) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(max, Math.floor(n));
};

const shapeTask = (task: any) => ({
  id: task.id,
  title: task.title || 'Untitled task',
  status: task.status || 'unknown',
  engine: task.engine || 'native',
  model: task.model || '',
  effort: task.effort || '',
  project_id: task.project_id || '',
  created_at: task.created_date || null,
  updated_at: task.updated_date || task.created_date || null,
});

async function resolveOwner(base44: any, wanted: any) {
  const all = await base44.asServiceRole.entities.User.list().catch(() => []);
  const users = Array.isArray(all) ? all : all?.items || [];
  if (wanted) return users.find((user: any) => user.id === String(wanted)) || null;
  return users.find((user: any) => user.role === 'admin') || users[0] || null;
}

export async function keyedAction(base44: any, action: string, body: any) {
  if (action === 'ping') {
    return { service: 'x1-apex-factory', bridge: 'x1-os', at: new Date().toISOString() };
  }

  if (action === 'status') {
    const [tasks, running, projects, templates, findings, benchmarks] = await Promise.all([
      base44.asServiceRole.entities.StudioTask.count(),
      base44.asServiceRole.entities.StudioTask.count({ status: 'running' }),
      base44.asServiceRole.entities.Project.count(),
      base44.asServiceRole.entities.Template.count(),
      base44.asServiceRole.entities.GuardianFinding.count({ status: 'open' }),
      base44.asServiceRole.entities.BenchmarkRun.list({ sort: '-observed_at', limit: 1 }),
    ]);
    const latest = (benchmarks?.items || [])[0] || null;
    const observations = Array.isArray(latest?.observations) ? latest.observations : [];
    return {
      service: 'x1-apex-factory',
      at: new Date().toISOString(),
      tasks: { total: tasks, running },
      projects,
      templates,
      open_findings: findings,
      benchmark: latest
        ? {
            at: latest.observed_at || null,
            revision: latest.revision || '',
            passed: observations.filter((o: any) => o.passed).length,
            total: observations.length,
          }
        : null,
    };
  }

  if (action === 'task.list') {
    const limit = limitOf(body?.limit, 10, 20);
    const status = typeof body?.status === 'string' && body.status.trim() ? body.status.trim() : '';
    const page = await base44.asServiceRole.entities.StudioTask.filter(
      status ? { status } : {},
      { sort: '-created_date', limit },
    );
    return {
      count: page.items.length,
      has_more: page.has_more === true,
      tasks: page.items.map(shapeTask),
    };
  }

  if (action === 'task.get') {
    const id = String(body?.id || '').trim();
    if (!id) throw new BridgeError('id is required.');
    const task = await base44.asServiceRole.entities.StudioTask.get(id).catch((e: any) =>
      e?.status === 404 ? null : Promise.reject(e),
    );
    if (!task) throw new BridgeError('No task with that id.', 404);
    const events = Array.isArray(task.events) ? task.events : [];
    return {
      task: shapeTask(task),
      instruction: task.instruction || '',
      deliverable: task.deliverable || null,
      steps: events.slice(-10).map((event: any) => ({
        role: event.role,
        content: String(event.content || '').slice(0, 1200),
        ts: event.ts || null,
      })),
      step_count: events.length,
    };
  }

  if (action === 'task.create') {
    const instruction = String(body?.instruction || '').trim();
    if (!instruction) throw new BridgeError('An instruction is required.');
    if (instruction.length > 6000) throw new BridgeError('That instruction is longer than 6000 characters.');
    const owner = await resolveOwner(base44, body?.owner_id);
    if (!owner) throw new BridgeError('No owner to attribute this run to. Send owner_id.', 409);
    const task = await createNativeTask(base44, {
      userId: owner.id,
      title: String(body?.title || '').slice(0, 120),
      instruction,
      model: body?.model,
      effort: body?.effort,
      projectId: String(body?.project_id || ''),
    });
    return {
      task_id: task.id,
      status: task.status,
      title: task.title || '',
      owner: { id: owner.id, email: owner.email || '' },
    };
  }

  if (action === 'finding.list') {
    const limit = limitOf(body?.limit, 10, 20);
    const page = await base44.asServiceRole.entities.GuardianFinding.filter(
      { status: 'open' },
      { sort: '-detected_at', limit },
    );
    return {
      count: page.items.length,
      findings: page.items.map((finding: any) => ({
        id: finding.id,
        severity: finding.severity || 'medium',
        area: finding.area || '',
        title: finding.title || '',
        detail: String(finding.detail || '').slice(0, 400),
        detected_at: finding.detected_at || finding.created_date || null,
      })),
    };
  }

  throw new BridgeError(`Unknown bridge action "${action}".`);
}