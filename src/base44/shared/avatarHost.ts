import { secrets } from "base44:runtime";

/**
 * Client for the app's OWN avatar host (see /avatar-host, deployed as the avatar-host service).
 * Her image lives there byte-for-byte; nothing is rented and no vendor sees it.
 */
export const AVATAR_RAILWAY = {
  endpoint: "https://backboard.railway.app/graphql/v2",
  projectId: "71393748-6467-45a9-a42d-3f7d457ec687",
  environmentId: "0e252a15-65fa-42d2-aaa9-dc376686e1ba",
  serviceId: "a18b90f3-da86-4fba-95a8-7f339bc91a86",
  serviceName: "avatar-host",
};

const TIMEOUT_MS = 25000;
const CACHE_MS = 5 * 60 * 1000;
const resolved = { url: null, token: null, at: 0, source: null };

export const NOT_CONNECTED =
  "The avatar host is not reachable yet. Deploy the container in avatar-host/ and set AVATAR_HOST_URL and AVATAR_HOST_TOKEN (or leave it on the avatar-host Railway service).";

async function railwayQuery(query, variables) {
  const key = secrets.get("RAILWAY_API_KEY");
  if (!key) throw new Error("RAILWAY_API_KEY is not set, so the avatar host cannot be resolved from Railway.");
  const response = await fetch(AVATAR_RAILWAY.endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(20000),
  });
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok && !payload.errors, data: payload.data || null, errors: payload.errors || null };
}

async function fromRailway() {
  const result = await railwayQuery(
    `query($p:String!,$e:String!,$s:String!){
      variables(projectId:$p, environmentId:$e, serviceId:$s)
      project(id:$p){ services { edges { node { id serviceInstances { edges { node { domains { serviceDomains { domain } } } } } } } } }
    }`,
    { p: AVATAR_RAILWAY.projectId, e: AVATAR_RAILWAY.environmentId, s: AVATAR_RAILWAY.serviceId }
  );
  if (!result.ok) return null;
  const token = (result.data.variables || {}).HOST_TOKEN;
  const domains = (result.data.project?.services?.edges || [])
    .filter((edge) => edge.node.id === AVATAR_RAILWAY.serviceId)
    .flatMap((edge) => (edge.node.serviceInstances?.edges || []).flatMap((i) => i.node?.domains?.serviceDomains || []));
  const domain = domains[0]?.domain;
  if (!token || !domain) return null;
  return { url: `https://${domain}`.replace(/\/+$/, ""), token: String(token), source: "railway" };
}

export async function ensureAvatarHost(force = false) {
  if (!force && resolved.url && Date.now() - resolved.at < CACHE_MS) return resolved;
  const url = secrets.get("AVATAR_HOST_URL");
  const token = secrets.get("AVATAR_HOST_TOKEN");
  let found = url && token ? { url: String(url).replace(/\/+$/, ""), token: String(token), source: "secret" } : null;
  if (!found) found = await fromRailway().catch(() => null);
  resolved.url = found ? found.url : null;
  resolved.token = found ? found.token : null;
  resolved.source = found ? found.source : null;
  resolved.at = Date.now();
  return resolved;
}

export function avatarConfigured() {
  return Boolean(resolved.url && resolved.token);
}

export function avatarSource() {
  return resolved.source;
}

function baseUrl() {
  if (!resolved.url) throw new Error(NOT_CONNECTED);
  return resolved.url;
}

function token() {
  if (!resolved.token) throw new Error(NOT_CONNECTED);
  return resolved.token;
}

async function hmacHex(key, message) {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** A short-lived URL the operator's browser can open without ever holding the token. */
export async function signedAvatarUrl(path, seconds = 1800) {
  const exp = Math.floor(Date.now() / 1000) + seconds;
  const sig = await hmacHex(token(), `${path}.${exp}`);
  return `${baseUrl()}${path}?exp=${exp}&sig=${sig}`;
}

export async function avatarJson(path, init = {}) {
  const headers = { Authorization: `Bearer ${token()}`, ...(init.headers || {}) };
  const response = await fetch(`${baseUrl()}${path}`, { ...init, headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
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

/** Send her still to the host exactly as it arrived — no re-encode on the way in. */
export async function uploadAvatar(bytes, contentType) {
  const headers = { Authorization: `Bearer ${token()}`, "Content-Type": contentType || "application/octet-stream" };
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: contentType || "application/octet-stream" }), "her.png");
  const response = await fetch(`${baseUrl()}/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}` },
    body: form,
    signal: AbortSignal.timeout(60000),
  });
  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data, error: response.ok ? null : (data && data.detail) || `HTTP ${response.status}` };
}