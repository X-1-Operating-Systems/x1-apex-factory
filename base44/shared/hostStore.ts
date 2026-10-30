import { secrets } from "base44:runtime";

/**
 * Durable record of what the owned browser host did.
 * The host keeps live sessions in memory and saved contexts on its volume;
 * this is the long-term ledger the app can report on. Writes are best effort:
 * a ledger failure must never break a browser action.
 */
const TIMEOUT_MS = 12000;

function config() {
  const url = secrets.get("SUPABASE_URL");
  const key = secrets.get("SUPABASE_SERVICE_KEY");
  if (!url || !key) return null;
  return { url: String(url).replace(/\/+$/, ""), key: String(key) };
}

async function write(table, body, { upsert = false } = {}) {
  const cfg = config();
  if (!cfg) return false;
  const prefer = upsert ? "resolution=merge-duplicates,return=minimal" : "return=minimal";
  try {
    const response = await fetch(`${cfg.url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
        Prefer: prefer,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function recordAudit({ actor, action, target, ok, detail }) {
  return write("host_audit", {
    actor: actor || "control-plane",
    action: String(action),
    target: target ? String(target) : null,
    ok: Boolean(ok),
    detail: detail && typeof detail === "object" ? detail : null,
  });
}

export async function recordSession(session) {
  return write(
    "host_session",
    {
      id: String(session.id),
      project_id: session.project_id ? String(session.project_id) : null,
      status: String(session.status || "RUNNING"),
      context_id: session.context_id ? String(session.context_id) : null,
      started_at: session.started_at || new Date().toISOString(),
      ended_at: session.ended_at || null,
      minutes: Number(session.minutes) || 0,
      action_count: Number(session.action_count) || 0,
      meta: session.meta || null,
    },
    { upsert: true }
  );
}

export async function recordRun(run) {
  return write(
    "host_run",
    {
      id: String(run.id),
      session_id: run.session_id ? String(run.session_id) : null,
      agent_id: run.agent_id ? String(run.agent_id) : null,
      task: run.task ? String(run.task).slice(0, 2000) : null,
      status: String(run.status || "RUNNING"),
      output: run.output || null,
      steps: Array.isArray(run.steps) ? run.steps.slice(-60) : null,
      error: run.error ? String(run.error).slice(0, 1000) : null,
      started_at: run.started_at || null,
      ended_at: run.ended_at || null,
    },
    { upsert: true }
  );
}

export async function recordUsage({ minutes, sessions, actions }) {
  const day = new Date().toISOString().slice(0, 10);
  return write(
    "host_usage",
    {
      day,
      minutes: Number(minutes) || 0,
      sessions: Number(sessions) || 0,
      actions: Number(actions) || 0,
    },
    { upsert: true }
  );
}

export async function countRows(table) {
  const cfg = config();
  if (!cfg) return null;
  try {
    const response = await fetch(`${cfg.url}/rest/v1/${table}?select=*&limit=1000`, {
      headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const rows = await response.json().catch(() => null);
    return Array.isArray(rows) ? rows.length : null;
  } catch {
    return null;
  }
}