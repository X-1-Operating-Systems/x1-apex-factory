import { secrets } from "base44:runtime";
import { railwayGraphQL } from "./browserHost.ts";

/**
 * Client for the app's OWN voice host (see /voice-host, published at github.com/x1-operator/voice-host).
 * It speaks with Piper and stores clone reference audio on its own volume. No vendor is called and no
 * reference audio leaves the container.
 *
 * Resolution order matches the browser host: explicit secrets first (operator override), then the
 * Railway service itself, so the app arms itself once that service has a build.
 */
const TIMEOUT_MS = 30000;

export const RAILWAY = {
  projectId: "71393748-6467-45a9-a42d-3f7d457ec687",
  environmentId: "0e252a15-65fa-42d2-aaa9-dc376686e1ba",
  serviceId: "1249e2f9-fb94-47c1-8f5f-11dbf9f8dc73",
  serviceName: "voice-host",
  domain: "voice-host-production-7726.up.railway.app",
  repo: "x1-operator/voice-host",
};

export const NOT_CONNECTED =
  "The voice host container has no build yet. Its Railway service (voice-host) needs the repo x1-operator/voice-host linked as its source, through the Railway GitHub app.";

const CACHE_MS = 5 * 60 * 1000;
const resolved = { url: null, token: null, at: 0, source: null };

function fromSecrets() {
  const url = secrets.get("VOICE_HOST_URL");
  const token = secrets.get("VOICE_HOST_TOKEN");
  if (url && token) return { url: String(url).replace(/\/+$/, ""), token: String(token), source: "secret" };
  return null;
}

async function fromRailway() {
  const result = await railwayGraphQL(
    `query($p:String!,$e:String!,$s:String!){
      variables(projectId:$p, environmentId:$e, serviceId:$s)
      project(id:$p){ services { edges { node { id serviceInstances { edges { node { domains { serviceDomains { domain } } } } } } } } }
    }`,
    { p: RAILWAY.projectId, e: RAILWAY.environmentId, s: RAILWAY.serviceId },
  );
  if (!result.ok) return null;
  const vars = result.data?.variables || {};
  const domains = (result.data?.project?.services?.edges || [])
    .filter((edge) => edge.node.id === RAILWAY.serviceId)
    .flatMap((edge) => (edge.node.serviceInstances?.edges || []).flatMap((i) => i.node?.domains?.serviceDomains || []));
  const token = vars.HOST_TOKEN;
  const domain = domains[0]?.domain;
  if (!token || !domain) return null;
  return { url: `https://${domain}`, token: String(token), source: "railway" };
}

/** Warm the connection once per function invocation. */
export async function ensureVoice(force = false) {
  if (!force && resolved.url && Date.now() - resolved.at < CACHE_MS) return resolved;
  let found = fromSecrets();
  if (!found) found = await fromRailway().catch(() => null);
  resolved.url = found ? found.url : null;
  resolved.token = found ? found.token : null;
  resolved.source = found ? found.source : null;
  resolved.at = Date.now();
  return resolved;
}

function baseUrl() {
  if (!resolved.url) throw new Error(NOT_CONNECTED);
  return resolved.url;
}

function token() {
  if (!resolved.token) throw new Error(NOT_CONNECTED);
  return resolved.token;
}

export function voiceConfigured() {
  return Boolean(resolved.url && resolved.token);
}

export function voiceUrl() {
  return resolved.url;
}

export async function voiceJson(path, init = {}) {
  await ensureVoice();
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