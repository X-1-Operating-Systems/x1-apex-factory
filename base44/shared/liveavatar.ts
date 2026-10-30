// LiveAvatar client (HeyGen's interactive avatar product).
// Two auth shapes: most routes take the account API key in X-API-KEY, while starting and
// stopping a session take the short-lived session token as a Bearer JWT — that is the vendor's
// own contract, so `auth: "bearer"` marks those actions and the token is never stored.

const HOST = "https://api.liveavatar.com";
const TIMEOUT_MS = 30000;
const TRIES = 3;

// The vendor's free sandbox avatar; sandbox sessions bill nothing and end after ~1 minute.
export const SANDBOX_AVATAR_ID = "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pick = (input, keys) => {
  const out = {};
  for (const key of keys) {
    const value = input[key];
    if (value !== undefined && value !== null && value !== "") out[key] = value;
  }
  return out;
};

const trimValue = (value, depth = 0) => {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return value.length > 1200 ? `${value.slice(0, 1200)}…` : value;
  if (typeof value !== "object") return value;
  if (depth >= 4) return Array.isArray(value) ? `[${value.length} items]` : "[object]";
  if (Array.isArray(value)) return value.slice(0, 40).map((item) => trimValue(item, depth + 1));
  const out = {};
  for (const key of Object.keys(value)) out[key] = trimValue(value[key], depth + 1);
  return out;
};

const pageQuery = (input, fallback) => {
  const size = Number(input.page_size);
  const pageSize = Number.isFinite(size) && size > 0 ? Math.min(Math.floor(size), 100) : fallback;
  const page = Number(input.page);
  return `?page=${Number.isFinite(page) && page > 0 ? Math.floor(page) : 1}&page_size=${pageSize}`;
};

export const LIVEAVATAR_ACTIONS = {
  "credits.get": {
    method: "GET",
    path: () => "/v1/users/credits",
    describe: "Credit balance for this LiveAvatar space.",
  },
  "languages.list": {
    method: "GET",
    path: () => "/v1/languages",
    describe: "Supported languages with their codes and display names.",
  },
  "avatars.list": {
    method: "GET",
    path: (i) => `/v1/avatars${pageQuery(i, 20)}`,
    describe: "Avatars owned by this space, with default voices and previews.",
  },
  "avatars.get": {
    method: "GET",
    path: (i) => `/v1/avatars/${encodeURIComponent(String(i.avatar_id))}`,
    requires: ["avatar_id"],
    describe: "One avatar's details.",
  },
  "voices.list": {
    method: "GET",
    path: (i) => `/v1/voices${pageQuery(i, 20)}`,
    describe: "Voices available to this space.",
  },
  "contexts.list": {
    method: "GET",
    path: (i) => `/v1/contexts${pageQuery(i, 20)}`,
    describe: "Saved contexts: avatar, voice and instructions, reusable across sessions.",
  },
  "contexts.create": {
    method: "POST",
    path: () => "/v1/contexts",
    requires: ["name"],
    body: (i) => pick(i, ["name", "avatar_id", "voice_id", "prompt", "greeting", "language"]),
    describe: "Create a context that pairs an avatar with a voice and instructions.",
  },
  "contexts.get": {
    method: "GET",
    path: (i) => `/v1/contexts/${encodeURIComponent(String(i.context_id))}`,
    requires: ["context_id"],
    describe: "One context's full configuration.",
  },
  "contexts.delete": {
    method: "DELETE",
    path: (i) => `/v1/contexts/${encodeURIComponent(String(i.context_id))}`,
    requires: ["context_id"],
    confirm: true,
    describe: "Delete a context.",
  },
  "sessions.token": {
    method: "POST",
    path: () => "/v1/sessions/token",
    requires: ["avatar_id"],
    body: (i) => {
      const mode = i.mode === "LITE" ? "LITE" : "FULL";
      const body = { mode, avatar_id: i.avatar_id };
      if (i.is_sandbox === true) body.is_sandbox = true;
      if (Number.isFinite(Number(i.max_session_duration)) && Number(i.max_session_duration) > 0) {
        body.max_session_duration = Math.min(Math.floor(Number(i.max_session_duration)), 3600);
      }
      // FULL mode requires exactly one of avatar_persona or voice_agent; LITE only when given.
      const persona = pick(i, ["voice_id", "context_id", "language"]);
      if (mode === "FULL" || Object.keys(persona).length) {
        body.avatar_persona = { language: "en", ...persona };
      }
      return body;
    },
    describe: "Mint a session token for an avatar. Cheap; set sandbox to test without spending credits.",
  },
  "sessions.start": {
    method: "POST",
    path: () => "/v1/sessions/start",
    requires: ["session_token"],
    auth: "bearer",
    confirm: true,
    describe: "Open a live interactive session from a token. Bills per minute unless the token is sandbox.",
  },
  "sessions.get": {
    method: "GET",
    path: (i) => `/v1/sessions/${encodeURIComponent(String(i.session_id))}`,
    requires: ["session_id"],
    describe: "One session's status.",
  },
  "sessions.list": {
    method: "GET",
    path: () => "/v1/sessions",
    describe: "Active sessions for this space.",
  },
  "sessions.transcript": {
    method: "GET",
    path: (i) => `/v1/sessions/${encodeURIComponent(String(i.session_id))}/transcript`,
    requires: ["session_id"],
    describe: "The conversation transcript of a finished session.",
  },
  "sessions.stop": {
    method: "POST",
    path: () => "/v1/sessions/stop",
    requires: ["session_token"],
    auth: "bearer",
    describe: "End a running session so it stops billing.",
  },
};

// Routes proven against the live account (sessions ran in the vendor's free sandbox).
const VERIFIED = [
  "credits.get",
  "avatars.list",
  "contexts.list",
  "sessions.token",
  "sessions.start",
  "sessions.stop",
];
for (const name of VERIFIED) {
  if (LIVEAVATAR_ACTIONS[name]) LIVEAVATAR_ACTIONS[name].verified = true;
}

export async function callLiveAvatar(action, input, apiKey) {
  const spec = LIVEAVATAR_ACTIONS[action];
  if (!spec) {
    return { ok: false, status: 404, error: `Unknown LiveAvatar action "${action}".`, verified: false };
  }
  const missing = (spec.requires || []).filter(
    (key) => input[key] === undefined || input[key] === null || input[key] === "",
  );
  if (missing.length) {
    return { ok: false, status: 400, error: `Missing ${missing.join(", ")}.`, verified: spec.verified === true };
  }

  const url = HOST + spec.path(input);
  let lastStatus = 0;
  let lastData = null;

  for (let attempt = 1; attempt <= TRIES; attempt += 1) {
    try {
      const headers = { Accept: "application/json" };
      if (spec.auth === "bearer") headers.Authorization = `Bearer ${input.session_token}`;
      else headers["X-API-KEY"] = apiKey;
      if (spec.body) headers["Content-Type"] = "application/json";

      const response = await fetch(url, {
        method: spec.method,
        headers,
        body: spec.body ? JSON.stringify(spec.body(input)) : undefined,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text.slice(0, 800) };
      }
      if ((response.status === 429 || response.status >= 500) && attempt < TRIES) {
        lastStatus = response.status;
        lastData = data;
        await sleep(700 * attempt);
        continue;
      }
      const detail = data?.detail?.[0]?.msg || data?.message;
      return {
        ok: response.ok,
        status: response.status,
        data: trimValue(data),
        verified: spec.verified === true,
        error: response.ok ? undefined : detail || `HTTP ${response.status}`,
        payload: data?.data ?? data,
      };
    } catch (error) {
      lastStatus = 0;
      lastData = { error: String(error?.message || error) };
      if (attempt < TRIES) {
        await sleep(700 * attempt);
        continue;
      }
    }
  }

  return {
    ok: false,
    status: lastStatus,
    data: lastData,
    verified: spec.verified === true,
    error: lastData?.error || `HTTP ${lastStatus}`,
  };
}

export function liveAvatarRegistry() {
  return Object.keys(LIVEAVATAR_ACTIONS).map((action) => {
    const spec = LIVEAVATAR_ACTIONS[action];
    return {
      action,
      method: spec.method,
      requires: spec.requires || [],
      confirm: spec.confirm === true,
      auth: spec.auth === "bearer" ? "bearer" : "api_key",
      verified: spec.verified === true,
      describe: spec.describe,
    };
  });
}