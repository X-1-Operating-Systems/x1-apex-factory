import { secrets } from "base44:runtime";

const HOST = "https://api.browserbase.com/v1";
const TIMEOUT_MS = 15000;
const TRIM_TO = 3500;

export const GUARDRAILS = {
  maxSessionSeconds: 600,
  hardCapSeconds: 1800,
  maxConcurrentSessions: 5,
  warnPercent: 80,
};

function apiKey() {
  const value = secrets.get("BROWSERBASE_API_KEY");
  if (!value) throw new Error("BROWSERBASE_API_KEY is not set");
  return value;
}

export function projectId() {
  const value = secrets.get("BROWSERBASE_PROJECT_ID");
  if (!value) throw new Error("BROWSERBASE_PROJECT_ID is not set");
  return value;
}

function enc(value) {
  if (value === undefined || value === null || value === "") {
    throw new Error("A record id is required for this action");
  }
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
  } catch (error) {
    return null;
  }
}

function settingsFrom(params) {
  const settings = {};
  if (params.block_ads !== undefined) settings.blockAds = Boolean(params.block_ads);
  if (params.solve_captchas !== undefined) settings.solveCaptchas = Boolean(params.solve_captchas);
  settings.recordSession = params.record_session === undefined ? true : Boolean(params.record_session);
  settings.logSession = params.log_session === undefined ? true : Boolean(params.log_session);
  if (params.verified !== undefined) settings.verified = Boolean(params.verified);
  if (params.os) settings.os = text(params.os, "os");
  if (params.context_id) {
    settings.context = { id: text(params.context_id, "context_id"), persist: params.context_persist !== false };
  }
  if (params.viewport && Number(params.viewport.width) && Number(params.viewport.height)) {
    settings.viewport = {
      width: Math.round(Number(params.viewport.width)),
      height: Math.round(Number(params.viewport.height)),
    };
  }
  return settings;
}

const ACTIONS = {
  "sessions.create": {
    kind: "write",
    summary: "Open a browser session. Params: timeout_seconds, keep_alive, region, proxies (true or array), block_ads, solve_captchas, record_session, log_session, verified, os, viewport {width,height}, context_id, context_persist, user_metadata.",
    method: "POST",
    path: () => "/sessions",
    body: (params) => ({
      projectId: projectId(),
      timeout: sessionTimeout(params.timeout_seconds),
      keepAlive: Boolean(params.keep_alive),
      region: text(params.region, "region"),
      proxies: params.proxies === true || Array.isArray(params.proxies) ? params.proxies : undefined,
      browserSettings: settingsFrom(params),
      userMetadata: params.user_metadata && typeof params.user_metadata === "object" ? params.user_metadata : undefined,
    }),
  },
  "sessions.list": {
    kind: "read",
    summary: "List sessions. Params: status, limit.",
    method: "GET",
    path: (params) => {
      const query = new URLSearchParams({ limit: String(limitOf(params.limit, 20)) });
      if (params.status) query.set("status", String(params.status));
      return `/sessions?${query.toString()}`;
    },
  },
  "sessions.get": {
    kind: "read",
    summary: "Read one session. Params: session_id.",
    method: "GET",
    path: (params) => `/sessions/${enc(needId(params, "session_id"))}`,
  },
  "sessions.release": {
    kind: "destructive",
    summary: "End a session and release it. Params: session_id.",
    method: "POST",
    path: (params) => `/sessions/${enc(needId(params, "session_id"))}`,
    body: () => ({ status: "REQUEST_RELEASE" }),
  },
  "sessions.debug": {
    kind: "read",
    summary: "Live view URLs for a session. Params: session_id.",
    method: "GET",
    path: (params) => `/sessions/${enc(needId(params, "session_id"))}/debug`,
  },
  "sessions.logs": {
    kind: "read",
    summary: "Session logs. Params: session_id, limit.",
    method: "GET",
    path: (params) => `/sessions/${enc(needId(params, "session_id"))}/logs?limit=${limitOf(params.limit, 50)}`,
  },
  "sessions.downloads": {
    kind: "read",
    summary: "Files produced by a session. Params: session_id.",
    method: "GET",
    path: (params) => `/sessions/${enc(needId(params, "session_id"))}/downloads`,
  },
  "sessions.recording": {
    kind: "read",
    summary: "Recording for a finished session. Params: session_id.",
    method: "GET",
    path: (params) => `/sessions/${enc(needId(params, "session_id"))}/recording`,
  },
  "sessions.replay": {
    kind: "read",
    summary: "Replay for a finished session. Params: session_id.",
    method: "GET",
    path: (params) => `/sessions/${enc(needId(params, "session_id"))}/replay`,
  },
  "contexts.create": {
    kind: "write",
    summary: "Create a persistent context for cookies and sign-ins. No params.",
    method: "POST",
    path: () => "/contexts",
    body: () => ({ projectId: projectId() }),
  },
  "contexts.get": {
    kind: "read",
    summary: "Read a context. Params: context_id.",
    method: "GET",
    path: (params) => `/contexts/${enc(needId(params, "context_id"))}`,
  },
  "contexts.delete": {
    kind: "destructive",
    summary: "Delete a context. Params: context_id.",
    method: "DELETE",
    path: (params) => `/contexts/${enc(needId(params, "context_id"))}`,
  },
  "projects.get": {
    kind: "read",
    summary: "Read the project settings. No params.",
    method: "GET",
    path: () => `/projects/${enc(projectId())}`,
  },
  "projects.update": {
    kind: "write",
    summary: "Update project settings. Params: name, default_timeout, allowed_domains (array).",
    method: "POST",
    path: () => `/projects/${enc(projectId())}`,
    body: (params) => ({
      name: text(params.name, "name"),
      defaultTimeout: params.default_timeout === undefined ? undefined : sessionTimeout(params.default_timeout),
      allowedDomains: Array.isArray(params.allowed_domains) ? params.allowed_domains.slice(0, 50).map(String) : undefined,
    }),
  },
  "usage.get": {
    kind: "read",
    summary: "Browser minutes used by the project. No params.",
    method: "GET",
    path: () => `/projects/${enc(projectId())}/usage`,
  },
  "webhooks.list": {
    kind: "read",
    summary: "List registered webhooks. No params.",
    method: "GET",
    path: () => "/webhooks",
  },
  "webhooks.create": {
    kind: "write",
    summary: "Register a webhook endpoint. Params: endpoint (url), event_types (array).",
    method: "POST",
    path: () => "/webhooks",
    body: (params) => ({
      endpoint: text(params.endpoint, "endpoint", true),
      eventTypes: Array.isArray(params.event_types) ? params.event_types.slice(0, 20).map(String) : undefined,
    }),
  },
  "webhooks.delete": {
    kind: "destructive",
    summary: "Remove a webhook. Params: webhook_id.",
    method: "DELETE",
    path: (params) => `/webhooks/${enc(needId(params, "webhook_id"))}`,
  },
  "agents.list": {
    kind: "read",
    summary: "List agents. Params: limit.",
    method: "GET",
    path: (params) => `/agents?limit=${limitOf(params.limit, 50)}`,
  },
  "agents.create": {
    kind: "write",
    summary: "Create an agent. Params: name, system_prompt, result_schema.",
    method: "POST",
    path: () => "/agents",
    body: (params) => ({
      name: text(params.name, "name", true),
      systemPrompt: text(params.system_prompt, "system_prompt"),
      resultSchema: params.result_schema && typeof params.result_schema === "object" ? params.result_schema : undefined,
    }),
  },
  "agents.get": {
    kind: "read",
    summary: "Read an agent. Params: agent_id.",
    method: "GET",
    path: (params) => `/agents/${enc(needId(params, "agent_id"))}`,
  },
  "agents.update": {
    kind: "write",
    summary: "Update an agent. Params: agent_id, name, system_prompt, result_schema.",
    method: "POST",
    path: (params) => `/agents/${enc(needId(params, "agent_id"))}`,
    body: (params) => ({
      name: text(params.name, "name"),
      systemPrompt: text(params.system_prompt, "system_prompt"),
      resultSchema: params.result_schema && typeof params.result_schema === "object" ? params.result_schema : undefined,
    }),
  },
  "agents.delete": {
    kind: "destructive",
    summary: "Delete an agent. Params: agent_id.",
    method: "DELETE",
    path: (params) => `/agents/${enc(needId(params, "agent_id"))}`,
  },
  "runs.create": {
    kind: "write",
    summary: "Start a browser run that does the work in a real browser. Params: task (plain instruction), agent_id, variables {name:{value,description}}, result_schema, context_id, session_id, max_steps.",
    method: "POST",
    path: () => "/agents/runs",
    body: (params) => {
      const browserSettings = {};
      if (params.context_id) {
        browserSettings.context = { id: text(params.context_id, "context_id"), persist: true };
      }
      if (params.proxies === true) browserSettings.proxies = true;
      if (params.session_id) browserSettings.sessionId = text(params.session_id, "session_id");
      if (params.max_steps !== undefined) browserSettings.maxSteps = Math.min(200, Math.max(1, Math.round(Number(params.max_steps) || 50)));
      return {
        task: text(params.task, "task", true),
        agentId: text(params.agent_id, "agent_id"),
        variables: params.variables && typeof params.variables === "object" ? params.variables : undefined,
        resultSchema: params.result_schema && typeof params.result_schema === "object" ? params.result_schema : undefined,
        browserSettings: Object.keys(browserSettings).length ? browserSettings : undefined,
      };
    },
  },
  "runs.list": {
    kind: "read",
    summary: "List runs. Params: agent_id, status, limit.",
    method: "GET",
    path: (params) => {
      const query = new URLSearchParams({ limit: String(limitOf(params.limit, 20)) });
      if (params.agent_id) query.set("agentId", String(params.agent_id));
      if (params.status) query.set("status", String(params.status));
      return `/agents/runs?${query.toString()}`;
    },
  },
  "runs.get": {
    kind: "read",
    summary: "Read one run, including its current status. Params: run_id.",
    method: "GET",
    path: (params) => `/agents/runs/${enc(needId(params, "run_id"))}`,
  },
  "runs.stop": {
    kind: "destructive",
    summary: "Stop a running run. Params: run_id.",
    method: "POST",
    path: (params) => `/agents/runs/${enc(needId(params, "run_id"))}/stop`,
    body: () => ({}),
  },
  "runs.resume": {
    kind: "write",
    summary: "Resume a paused run. Params: run_id.",
    method: "POST",
    path: (params) => `/agents/runs/${enc(needId(params, "run_id"))}/resume`,
    body: () => ({}),
  },
  "runs.messages": {
    kind: "read",
    summary: "Step-by-step transcript of a run. Params: run_id, limit.",
    method: "GET",
    path: (params) => `/agents/runs/${enc(needId(params, "run_id"))}/messages?limit=${limitOf(params.limit, 50)}`,
  },
  "runs.files": {
    kind: "read",
    summary: "Files produced by a run. Params: run_id.",
    method: "GET",
    path: (params) => `/agents/runs/${enc(needId(params, "run_id"))}/files`,
  },
  "functions.list": {
    kind: "read",
    summary: "List deployed browser functions. No params.",
    method: "GET",
    path: () => "/functions",
  },
  "functions.invoke": {
    kind: "write",
    summary: "Invoke a deployed browser function. Params: function_id, params.",
    method: "POST",
    path: (params) => `/functions/${enc(needId(params, "function_id"))}/invoke`,
    body: (params) => (params.params && typeof params.params === "object" ? params.params : {}),
  },
  "certificates.list": {
    kind: "read",
    summary: "List client certificates. No params.",
    method: "GET",
    path: () => "/certificates",
  },
  "extensions.list": {
    kind: "read",
    summary: "List uploaded browser extensions. No params.",
    method: "GET",
    path: () => "/extensions",
  },
  "identities.list": {
    kind: "read",
    summary: "List saved agent identities. No params.",
    method: "GET",
    path: () => "/identities",
  },
  "search.web": {
    kind: "read",
    summary: "Web search through Browserbase. Params: query, num_results.",
    method: "POST",
    path: () => "/search/web",
    body: (params) => ({
      query: text(params.query, "query", true),
      numResults: Math.min(20, Math.max(1, Math.round(Number(params.num_results) || 10))),
    }),
  },
};

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

export async function bbRequest(action, params) {
  const spec = ACTIONS[action];
  if (!spec) throw new Error(`Unknown Browserbase action: ${action}`);
  const input = params && typeof params === "object" ? params : {};
  const path = spec.path(input);
  const body = spec.body ? spec.body(input) : undefined;
  const started = Date.now();
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const headers = { "X-BB-API-Key": apiKey() };
      if (body) headers["Content-Type"] = "application/json";
      const response = await fetch(`${HOST}${path}`, {
        method: spec.method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const raw = await response.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (error) {
        data = { text: raw.slice(0, TRIM_TO) };
      }
      if ((response.status === 429 || response.status >= 500) && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1) * (attempt + 1)));
        continue;
      }
      const message = data && (data.message || data.error) ? String(data.message || data.error) : `HTTP ${response.status}`;
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
    error: lastError && lastError.message ? lastError.message : "Request failed",
    ms: Date.now() - started,
  };
}