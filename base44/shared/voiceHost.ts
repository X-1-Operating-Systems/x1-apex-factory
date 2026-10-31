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

/** Text in, WAV out, on the owned container. */
export async function speak(text, voiceId) {
  return voiceJson("/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_id: voiceId || "preset:river" }),
  });
}

/** Reference audio in, a private clone id out. The bytes are never re-encoded on the way in. */
export async function uploadClone(bytes, name, contentType = "audio/wav") {
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: contentType }), "reference.wav");
  form.append("name", name || "Unnamed clone");
  return voiceJson("/clone", { method: "POST", body: form });
}

export async function voiceList() {
  return voiceJson("/voices");
}

/** A WAV the browser can play without ever holding the host token. */
export function voiceFileUrl(jobId) {
  return `${resolved.url}/voice/${jobId}.wav`;
}