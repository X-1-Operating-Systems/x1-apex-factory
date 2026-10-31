import { secrets } from "base44:runtime";

/**
 * Client for the app's OWN voice host (see /voice-host). It speaks with Piper and stores clone
 * reference audio on its own volume. No vendor is called and no reference audio leaves the container.
 *
 * It resolves only from its own two secrets: nothing here guesses a Railway service id.
 */
const TIMEOUT_MS = 30000;

export const NOT_CONNECTED =
  "The voice host is not reachable yet. Deploy the container in voice-host/ (Railway root directory voice-host, volume at /data) and set VOICE_HOST_URL and VOICE_HOST_TOKEN.";

function baseUrl() {
  const url = secrets.get("VOICE_HOST_URL");
  if (!url) throw new Error(NOT_CONNECTED);
  return String(url).replace(/\/+$/, "");
}

function token() {
  const value = secrets.get("VOICE_HOST_TOKEN");
  if (!value) throw new Error(NOT_CONNECTED);
  return String(value);
}

export function voiceConfigured() {
  return Boolean(secrets.get("VOICE_HOST_URL") && secrets.get("VOICE_HOST_TOKEN"));
}

export async function voiceJson(path, init = {}) {
  const headers = { Authorization: `Bearer ${token()}`, ...(init.headers || {}) };
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
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
  return `${baseUrl()}/renders/${jobId}.wav`;
}