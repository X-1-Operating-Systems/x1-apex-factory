import { ensureAvatarHost } from "./avatarHost.ts";

/**
 * The app's own speech surface. It runs inside the avatar host container — the same image that
 * already carries Piper and a volume — so voice costs nothing extra to run and no reference audio
 * ever leaves it. Presets synthesise here; clone reference audio is stored and kept.
 */
const TIMEOUT_MS = 30000;

export const NOT_CONNECTED =
  "The speech service is not reachable: it runs inside the avatar host container, which is offline. Deploy avatar-host/ on the avatar-host Railway service (or set AVATAR_HOST_URL and AVATAR_HOST_TOKEN).";

const resolved = { url: null, token: null, at: 0, source: null };

/** Same connection as the avatar host, because it is the same container. */
export async function ensureVoice(force = false) {
  const host = await ensureAvatarHost(force);
  resolved.url = host.url;
  resolved.token = host.token;
  resolved.source = host.source;
  resolved.at = Date.now();
  return resolved;
}

export function voiceConfigured() {
  return Boolean(resolved.url && resolved.token);
}

export function voiceUrl() {
  return resolved.url;
}

export async function voiceJson(path, init = {}) {
  await ensureVoice();
  if (!resolved.url || !resolved.token) throw new Error(NOT_CONNECTED);
  const headers = { Authorization: `Bearer ${resolved.token}`, ...(init.headers || {}) };
  const response = await fetch(`${resolved.url}${path}`, { ...init, headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { text: raw.slice(0, 800) };
  }
  return {
    ok: response.ok,
    status: response.status,
    data,
    error: response.ok ? null : (data && (data.detail || data.error || data.message)) || `HTTP ${response.status}`,
  };
}

/** Text in, audio out — with the voice, prosody, emotion and format the studio asked for. */
export async function speak(input, voiceId) {
  const body = typeof input === "string" ? { text: input } : { ...(input || {}) };
  body.voice_id = body.voice_id || voiceId || "preset:river";
  return voiceJson("/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Pull a Piper language onto the volume at runtime — no rebuild, no vendor. */
export async function installVoice(voice) {
  return voiceJson("/voices/install", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voice }),
  });
}

/** Reference audio in, a private clone id out. The bytes are never re-encoded on the way in. */
export async function uploadClone(bytes, name, defaults = {}, contentType = "audio/wav") {
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: contentType }), "reference.wav");
  form.append("name", name || "Unnamed clone");
  form.append("speed", String(defaults.speed ?? 1));
  form.append("pitch", String(defaults.pitch ?? 0));
  form.append("volume", String(defaults.volume ?? 1));
  form.append("emotion", String(defaults.emotion || "neutral"));
  return voiceJson("/clone", { method: "POST", body: form });
}

export async function voiceList() {
  return voiceJson("/voices");
}

export async function voiceHistory(limit = 40) {
  return voiceJson(`/voice/history?limit=${Math.max(1, Math.min(200, limit))}`);
}

export async function removeClone(voiceId) {
  return voiceJson(`/clone/${encodeURIComponent(voiceId)}`, { method: "DELETE" });
}

export async function removeRender(jobId) {
  return voiceJson(`/voice/${encodeURIComponent(jobId)}`, { method: "DELETE" });
}

/**
 * The bytes, carried through the app so the browser plays a private render without ever holding
 * the host token. Bounded: nothing over 12 MB is moved through a function.
 */
export async function audioBytes(path) {
  await ensureVoice();
  if (!resolved.url || !resolved.token) throw new Error(NOT_CONNECTED);
  const response = await fetch(`${resolved.url}${path}`, {
    headers: { Authorization: `Bearer ${resolved.token}` },
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) return { ok: false, status: response.status, error: `HTTP ${response.status}` };
  const buffer = new Uint8Array(await response.arrayBuffer());
  if (buffer.byteLength > 12 * 1024 * 1024) {
    return { ok: false, status: 413, error: "That file is larger than the 12 MB playback limit." };
  }
  let binary = "";
  const step = 0x8000;
  for (let i = 0; i < buffer.length; i += step) {
    binary += String.fromCharCode(...buffer.subarray(i, i + step));
  }
  return {
    ok: true,
    status: 200,
    mime: response.headers.get("content-type") || "audio/wav",
    bytes: buffer.byteLength,
    audio_base64: btoa(binary),
  };
}