// HeyGen client, on the v3 API (v1/v2 are retired on 2026-10-31).
// Every action is a fixed host, method and URL shape with whitelisted parameters, so this can
// never become an arbitrary proxy. `verified: true` = the route answered against this account.

const HOST = "https://api.heygen.com";
const TIMEOUT_MS = 30000;
const TRIES = 3;

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

const limitOf = (input, fallback, max) => {
  const raw = Number(input.limit);
  if (!Number.isFinite(raw) || raw <= 0) return fallback;
  return Math.min(Math.floor(raw), max);
};

export const HEYGEN_ACTIONS = {
  "account.me": {
    method: "GET",
    path: () => "/v3/users/me",
    describe: "Your account profile, plan tier and credit balance.",
  },
  "avatars.list": {
    method: "GET",
    path: (i) => `/v3/avatars?limit=${limitOf(i, 20, 50)}`,
    describe: "Avatar groups and looks available to the account.",
  },
  "avatars.get": {
    method: "GET",
    path: (i) => `/v3/avatars/${encodeURIComponent(String(i.avatar_id))}`,
    requires: ["avatar_id"],
    describe: "One avatar group by id, including a clone the catalogue page does not list.",
  },
  "voices.list": {
    method: "GET",
    path: (i) => `/v3/voices?limit=${limitOf(i, 20, 50)}`,
    describe: "Voices with ids, languages and previews.",
  },
  "voices.get": {
    method: "GET",
    path: (i) => `/v3/voices/${encodeURIComponent(String(i.voice_id))}`,
    requires: ["voice_id"],
    describe: "One voice by id, including a private clone the catalogue page does not list.",
  },
  "videos.create": {
    method: "POST",
    path: () => "/v3/videos",
    requires: ["avatar_id", "script"],
    body: (i) => ({
      type: "avatar",
      avatar_id: i.avatar_id,
      script: String(i.script),
      ...(i.voice_id ? { voice_id: i.voice_id } : {}),
      ...(i.engine ? { engine: i.engine } : {}),
      aspect_ratio: i.ratio || "auto",
      resolution: i.resolution === "720p" ? "720p" : "1080p",
      ...(i.title ? { title: String(i.title).slice(0, 120) } : {}),
      ...(i.caption === true ? { caption: true } : {}),
    }),
    confirm: true,
    describe: "Render an avatar video from a script. Spends credits per minute of output.",
  },
  "videos.get": {
    method: "GET",
    path: (i) => `/v3/videos/${encodeURIComponent(String(i.video_id))}`,
    requires: ["video_id"],
    describe: "One video's status, and its URL and duration once completed.",
  },
  "videos.list": {
    method: "GET",
    path: (i) => `/v3/videos?limit=${limitOf(i, 10, 50)}`,
    describe: "Recent videos with their status and URLs.",
  },
  "videos.delete": {
    method: "DELETE",
    path: (i) => `/v3/videos/${encodeURIComponent(String(i.video_id))}`,
    requires: ["video_id"],
    confirm: true,
    describe: "Delete a video from the workspace.",
  },
  "video_agents.create": {
    method: "POST",
    path: () => "/v3/video-agents",
    requires: ["prompt"],
    body: (i) => ({
      prompt: String(i.prompt).slice(0, 4000),
      ...(i.callback_url ? { callback_url: i.callback_url } : {}),
    }),
    confirm: true,
    describe: "Prompt to video: HeyGen scripts it, picks avatar and voice, and renders. Spends credits.",
  },
  "video_agents.get": {
    method: "GET",
    path: (i) => `/v3/video-agents/${encodeURIComponent(String(i.session_id))}`,
    requires: ["session_id"],
    describe: "A video-agent session: its storyboard and the video_id once rendering starts.",
  },
  "templates.list": {
    method: "GET",
    path: (i) => `/v3/templates?limit=${limitOf(i, 10, 50)}`,
    describe: "Templates on the account.",
  },
  "templates.generate": {
    method: "POST",
    path: (i) => `/v3/templates/${encodeURIComponent(String(i.template_id))}`,
    requires: ["template_id", "variables"],
    body: (i) => ({ variables: i.variables }),
    confirm: true,
    describe: "Render a template with its variables filled in. Spends credits.",
  },
  "translations.create": {
    method: "POST",
    path: () => "/v3/video-translations",
    requires: ["video_url", "output_language"],
    body: (i) => pick(i, ["video_url", "output_language", "title", "mode"]),
    confirm: true,
    describe: "Translate a video into another language with lip-sync. Spends credits.",
  },
  "translations.get": {
    method: "GET",
    path: (i) => `/v3/video-translations/${encodeURIComponent(String(i.translation_id))}`,
    requires: ["translation_id"],
    describe: "A translation's status, URL and caption files.",
  },
  "translations.languages": {
    method: "GET",
    path: () => "/v3/video-translations/languages",
    describe: "Supported translation target languages.",
  },
  "speech.create": {
    method: "POST",
    path: () => "/v3/voices/speech",
    requires: ["text", "voice_id"],
    body: (i) => ({ text: String(i.text).slice(0, 5000), voice_id: i.voice_id }),
    describe: "Text to speech in any account voice. Returns an audio URL.",
  },
  "voices.clone": {
    method: "POST",
    path: () => "/v3/voices/clone",
    requires: ["name", "file_url"],
    body: (i) => pick(i, ["name", "file_url", "language", "gender"]),
    confirm: true,
    describe: "Clone a voice from one recording. Consumes voice-clone allowance.",
  },
  "webhooks.list": {
    method: "GET",
    path: () => "/v3/webhooks/endpoints",
    describe: "Registered webhook endpoints, their events and their secret state.",
  },
  "webhooks.create": {
    method: "POST",
    path: () => "/v3/webhooks/endpoints",
    requires: ["url"],
    body: (i) => pick(i, ["url", "events", "name"]),
    confirm: true,
    describe: "Register a webhook endpoint so renders report back to this app.",
  },
  "webhooks.delete": {
    method: "DELETE",
    path: (i) => `/v3/webhooks/endpoints/${encodeURIComponent(String(i.endpoint_id))}`,
    requires: ["endpoint_id"],
    confirm: true,
    describe: "Remove a webhook endpoint.",
  },
};

// Routes proven against the live account. Everything else still calls the real API and reports
// the vendor's own error, but its shape has not been confirmed here yet.
const VERIFIED = ["account.me", "avatars.list", "voices.list", "avatars.get", "voices.get"];
for (const name of VERIFIED) {
  if (HEYGEN_ACTIONS[name]) HEYGEN_ACTIONS[name].verified = true;
}

const keyOfResult = (payload) => payload?.data ?? payload;

export async function callHeyGen(action, input, apiKey) {
  const spec = HEYGEN_ACTIONS[action];
  if (!spec) {
    return { ok: false, status: 404, error: `Unknown HeyGen action "${action}".`, verified: false };
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
      const headers = { "X-Api-Key": apiKey, Accept: "application/json" };
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
      const errorCode = data?.error?.code || data?.error?.message;
      return {
        ok: response.ok,
        status: response.status,
        data: trimValue(data),
        verified: spec.verified === true,
        error: response.ok ? undefined : errorCode || `HTTP ${response.status}`,
        payload: keyOfResult(data),
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

export function heygenRegistry() {
  return Object.keys(HEYGEN_ACTIONS).map((action) => {
    const spec = HEYGEN_ACTIONS[action];
    return {
      action,
      method: spec.method,
      requires: spec.requires || [],
      confirm: spec.confirm === true,
      verified: spec.verified === true,
      describe: spec.describe,
    };
  });
}