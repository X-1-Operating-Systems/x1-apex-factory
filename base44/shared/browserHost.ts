import { secrets } from "base44:runtime";

/**
 * Client for the app's OWN browser host (see /browser-host).
 * Nothing here talks to a third party: one container you run, reached with a token you set.
 */
const TIMEOUT_MS = 25000;
const TRIM_TO = 3500;

export const GUARDRAILS = {
  maxSessionSeconds: 600,
  hardCapSeconds: 1800,
  maxConcurrentSessions: 5,
  warnPercent: 80,
};

export const PAGE_ACTIONS = [
  "goto",
  "click",
  "click_text",
  "fill",
  "type",
  "press",
  "select",
  "scroll",
  "wait_for",
  "wait",
  "extract_text",
  "extract_links",
  "snapshot",
  "screenshot",
  "back",
  "forward",
  "reload",
  "url",
];

export const NOT_CONNECTED =
  "The browser host is not connected yet. Deploy the container in browser-host/ and set BROWSER_HOST_URL and BROWSER_HOST_TOKEN.";

function baseUrl() {
  const value = secrets.get("BROWSER_HOST_URL");
  if (!value) throw new Error(NOT_CONNECTED);
  return String(value).replace(/\/+$/, "");
}

function token() {
  const value = secrets.get("BROWSER_HOST_TOKEN");
  if (!value) throw new Error(NOT_CONNECTED);
  return String(value);
}

export function hostConfigured() {
  try {
    baseUrl();
    token();
    return true;
  } catch {
    return false;
  }
}

async function hmacHex(key, message) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** A short-lived frame URL the operator's browser can open without ever holding the token. */
export async function signedFrameUrl(sessionId, seconds = 900) {
  const exp = Math.floor(Date.now() / 1000) + seconds;
  const sig = await hmacHex(token(), `${sessionId}.${exp}`);
  return `${baseUrl()}/sessions/${sessionId}/frame.jpg?exp=${exp}&sig=${sig}`;
}

function enc(value) {
  if (value === undefined || value === null || value === "") throw new Error("A record id is required for this action");
  return encodeURIComponent(String(value));
}

function needId(params, field) {
  if (!params || params[field] === undefined || params[field] === null || params[field] === "") {
    throw new Error(`${field} is required`);
  }
  return String(params[field]);
}

function text(value, field, required) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${field} is required`);
    return undefined;
  }
  if (typeof value !== "string") throw new Error(`${field} must be text`);
  return value;
}

function limitOf(value, fallback) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return fallback === undefined ? 20 : fallback;
  return Math.min(100, Math.max(1, Math.round(raw)));
}

function sessionTimeout(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return GUARDRAILS.maxSessionSeconds;
  return Math.min(GUARDRAILS.hardCapSeconds, Math.max(60, Math.round(raw)));
}

function trimmed(data) {
  if (data === null || data === undefined) return null;
  try {
    const serialized = JSON.stringify(data);
    if (!serialized || serialized.length <= TRIM_TO) return data;
    return { truncated: true, preview: serialized.slice(0, TRIM_TO) };
  } catch {
    return null;
  }
}

const HOST_ACTIONS = {
  "sessions.create": {
    kind: "write",
    summary: "Open a browser session on the app's own host. Params: timeout_seconds, keep_alive, context_id, viewport {width,height}, allowed_domains (array).",
    method: "POST",
    path: () => "/sessions",
    body: (params) => ({
      timeout_seconds: sessionTimeout(params.timeout_seconds),
      keep_alive: Boolean(params.keep_alive),
      context_id: text(params.context_id, "context_id"),
      allowed_domains: Array.isArray(params.allowed_domains) ? params.allowed_domains.slice(0, 50).map(String) : undefined,
      viewport:
        params.viewport && Number(params.viewport.width) && Number(params.viewport.height)
          ? { width: Math.round(Number(params.viewport.width)), height: Math.round(Number(params.viewport.height)) }
          : undefined,
    }),
  },
  "sessions.list": {
    kind: "read",
    summary: "List sessions on the host. Params: status, limit.",
    method: "GET",
    path: (params) => {
      const query = new URLSearchParams({ limit: String(limitOf(params.limit, 20)) });
      if (params.status) query.set("status", String(params.status).toUpperCase());
      return `/sessions?${query.toString()}`;
    },
  },
  "sessions.get": {
    kind: "read",
    summary: "Read one session, including its recent actions. Params: session_id.",
    method: "GET",
    path: (params) => `/sessions/${enc(needId(params, "session_id"))}`,
  },
  "sessions.release": {
    kind: "destructive",
    summary: "End a session and free the browser. Params: session_id.",
    method: "POST",
    path: (params) => `/sessions/${enc(needId(params, "session_id"))}/release`,
  },
  "sessions.debug": {
    kind: "read",
    summary: "Live view URL for a session. Params: session_id.",
    method: "GET",
    path: (params) => `/sessions/${enc(needId(params, "session_id"))}`,
  },
  "sessions.logs": {
    kind: "read",
    summary: "Session action log. Params: session_id, limit.",
    method: "GET",
    path: (params) => `/sessions/${enc(needId(params, "session_id"))}/logs?limit=${limitOf(params.limit, 50)}`,
  },
  "sessions.downloads": {
    kind: "read",
    summary: "Files produced by a session. Params: session_id.",
    method: "GET",
    path: (params) => `/sessions/${enc(needId(params, "session_id"))}/downloads`,
  },
  "sessions.act": {
    kind: "write",
    summary: `Do something in the page of a session. Params: session_id, page_action (${PAGE_ACTIONS.join(", ")}), and that action's inputs (url, selector, text, value, key, delta, selector, ms).`,
    method: "POST",
    path: (params) => `/sessions/${enc(needId(params, "session_id"))}/actions`,
    body: (params) => {
      const pageAction = text(params.page_action, "page_action", true);
      if (!PAGE_ACTIONS.includes(pageAction)) throw new Error(`page_action must be one of: ${PAGE_ACTIONS.join(", ")}`);
      const inner = {};
      for (const key of ["url", "selector", "text", "value", "key", "delta", "ms", "limit", "timeout_ms", "submit", "full_page"]) {
        if (params[key] !== undefined) inner[key] = params[key];
      }
      return { action: pageAction, params: inner };
    },
  },
  "contexts.create": {
    kind: "write",
    summary: "Create a saved context for cookies and sign-ins. No params.",
    method: "POST",
    path: () => "/contexts",
  },
  "contexts.get": {
    kind: "read",
    summary: "Read a saved context. Params: context_id.",
    method: "GET",
    path: (params) => `/contexts/${enc(needId(params, "context_id"))}`,
  },
  "contexts.delete": {
    kind: "destructive",
    summary: "Delete a saved context. Params: context_id.",
    method: "DELETE",
    path: (params) => `/contexts/${enc(needId(params, "context_id"))}`,
  },
  "projects.get": {
    kind: "read",
    summary: "Read the host configuration. No params.",
    method: "GET",
    path: () => "/project",
  },
  "projects.update": {
    kind: "write",
    summary: "Update the host configuration. Params: name, default_timeout, allowed_domains (array).",
    method: "POST",
    path: () => "/project",
    body: (params) => ({
      name: text(params.name, "name"),
      default_timeout: params.default_timeout === undefined ? undefined : sessionTimeout(params.default_timeout),
      allowed_domains: Array.isArray(params.allowed_domains) ? params.allowed_domains.slice(0, 50).map(String) : undefined,
    }),
  },
  "usage.get": {
    kind: "read",
    summary: "Browser minutes and session counts from your own host. No params.",
    method: "GET",
    path: () => "/usage",
  },
};

const LOCAL_ACTIONS = {
  "host.status": { kind: "read", summary: "Whether the app can reach its browser host. No params." },
  "agents.list": { kind: "read", summary: "List browser agents. Params: limit." },
  "agents.create": { kind: "write", summary: "Create a browser agent. Params: name, system_prompt, result_schema." },
  "agents.get": { kind: "read", summary: "Read an agent. Params: agent_id." },
  "agents.update": { kind: "write", summary: "Update an agent. Params: agent_id, name, system_prompt, result_schema." },
  "agents.delete": { kind: "destructive", summary: "Delete an agent. Params: agent_id." },
  "runs.create": {
    kind: "write",
    summary: "Start a run that works a real browser. Params: task (plain instruction), agent_id, context_id, max_steps.",
  },
  "runs.list": { kind: "read", summary: "List runs. Params: status, limit." },
  "runs.get": { kind: "read", summary: "Read a run; advances it while it is active. Params: run_id." },
  "runs.stop": { kind: "destructive", summary: "Stop a run. Params: run_id." },
  "runs.resume": { kind: "write", summary: "Resume a run. Params: run_id." },
  "runs.messages": { kind: "read", summary: "Step-by-step transcript of a run. Params: run_id." },
  "runs.files": { kind: "read", summary: "Files produced by a run. Params: run_id." },
};

const ACTIONS = { ...HOST_ACTIONS, ...LOCAL_ACTIONS };

export function listActions() {
  return Object.entries(ACTIONS).map(([name, spec]) => ({ name, kind: spec.kind, summary: spec.summary }));
}

export function actionExists(action) {
  return Boolean(ACTIONS[action]);
}

export function isDestructive(action) {
  const spec = ACTIONS[action];
  return Boolean(spec && spec.kind === "destructive");
}

export function actionSummary(action) {
  const spec = ACTIONS[action];
  return spec ? spec.summary : "";
}

export function isHostAction(action) {
  return Boolean(HOST_ACTIONS[action]);
}

export async function hostRequest(action, params) {
  const spec = HOST_ACTIONS[action];
  if (!spec) throw new Error(`Unknown browser host action: ${action}`);
  const input = params && typeof params === "object" ? params : {};
  const path = spec.path(input);
  const body = spec.body ? spec.body(input) : undefined;
  const started = Date.now();
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const headers = { Authorization: `Bearer ${token()}` };
      if (body) headers["Content-Type"] = "application/json";
      const response = await fetch(`${baseUrl()}${path}`, {
        method: spec.method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const raw = await response.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = { text: raw.slice(0, TRIM_TO) };
      }
      if ((response.status === 429 || response.status >= 500) && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1) * (attempt + 1)));
        continue;
      }
      const message = data && (data.error || data.message) ? String(data.error || data.message) : `HTTP ${response.status}`;
      return {
        ok: response.ok,
        action,
        method: spec.method,
        path,
        status: response.status,
        data: trimmed(data),
        error: response.ok ? null : message,
        ms: Date.now() - started,
      };
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }

  return {
    ok: false,
    action,
    method: spec.method,
    path,
    status: 0,
    data: null,
    error: lastError && lastError.message ? lastError.message : "The browser host did not answer.",
    ms: Date.now() - started,
  };
}

/** Host call with the live-view URL attached for session reads. */
export async function hostCall(action, params) {
  if (action === "sessions.debug" && params?.session_id) {
    const base = await hostRequest("sessions.get", params);
    if (!base.ok) return base;
    const frameUrl = await signedFrameUrl(String(params.session_id));
    return { ...base, data: { ...(base.data || {}), frameUrl } };
  }
  return hostRequest(action, params);
}