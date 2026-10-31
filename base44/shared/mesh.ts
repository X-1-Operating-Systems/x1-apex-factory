// The mesh: every system this project is wired to, probed in both directions.
// A node is OK only when a real call answered; a node missing its address says which secret arms it.

export const PUBLISHED = 'https://x1-apex-factory.base44.app';
const TIMEBOX = 9000;

async function hit(url, init = {}, ms = TIMEBOX) {
  const started = Date.now();
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
    const text = await res.text();
    return { ok: res.ok, status: res.status, ms: Date.now() - started, text: text.slice(0, 400) };
  } catch (err) {
    return { ok: false, status: 0, ms: Date.now() - started, text: String(err?.message || err).slice(0, 400) };
  }
}

const row = (id, label, kind, extra) => ({
  id,
  label,
  kind,
  inbound: false,
  outbound: false,
  ok: false,
  status: 0,
  ms: 0,
  detail: '',
  needs: '',
  ...extra,
});

async function base44Node(key) {
  const r = await hit(`${PUBLISHED}/functions/x1Bridge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-x1-bridge-key': key || '' },
    body: JSON.stringify({ action: 'ping' }),
  });
  return row('base44', 'Base 44 (this factory)', 'host', {
    inbound: true,
    outbound: r.ok,
    ok: r.ok,
    status: r.status,
    ms: r.ms,
    detail: r.ok ? 'The published bridge answered a keyed ping' : `Bridge answered ${r.status || 'nothing'}`,
    needs: r.ok ? '' : 'X1_BRIDGE_KEY',
  });
}

async function mcpNode() {
  const r = await hit(`${PUBLISHED}/api/mcp`, { method: 'GET' });
  const gated = [200, 401, 403, 405].includes(r.status);
  return row('gpt', 'GPT (MCP server)', 'client', {
    inbound: gated,
    outbound: false,
    ok: gated,
    status: r.status,
    ms: r.ms,
    detail: gated
      ? `/api/mcp is live and answers ${r.status} — the client authorizes once, then calls in`
      : `No answer from /api/mcp (${r.status || 'timeout'})`,
  });
}

async function railwayNode(key) {
  if (!key) return row('railway', 'Railway', 'infra', { needs: 'RAILWAY_API_KEY' });
  const r = await hit('https://backboard.railway.app/graphql/v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ query: 'query { me { name email } }' }),
  });
  const name = r.text.match(/"name":"([^"]+)"/)?.[1] || '';
  return row('railway', 'Railway', 'infra', {
    outbound: r.ok,
    ok: r.ok,
    status: r.status,
    ms: r.ms,
    detail: r.ok ? `Authenticated${name ? ` as ${name}` : ''} — deploy and host health are readable and writable` : `Railway answered ${r.status || 'nothing'}`,
    needs: r.ok ? '' : 'RAILWAY_API_KEY',
  });
}

async function vercelNode(key) {
  if (!key) return row('vercel', 'Vercel', 'infra', { needs: 'VERCEL_API_KEY' });
  const r = await hit('https://api.vercel.com/v2/user', { headers: { Authorization: `Bearer ${key}` } });
  const who = r.text.match(/"username":"([^"]+)"/)?.[1] || '';
  return row('vercel', 'Vercel', 'infra', {
    outbound: r.ok,
    ok: r.ok,
    status: r.status,
    ms: r.ms,
    detail: r.ok ? `Authenticated${who ? ` as ${who}` : ''} — releases can ship` : `Vercel answered ${r.status || 'nothing'}`,
    needs: r.ok ? '' : 'VERCEL_API_KEY',
  });
}

async function supabaseNode(url, key) {
  if (!url || !key) return row('supabase', 'Supabase', 'data', { needs: 'SUPABASE_URL + SUPABASE_SERVICE_KEY' });
  const r = await hit(`${url.replace(/\/$/, '')}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return row('supabase', 'Supabase', 'data', {
    outbound: r.ok,
    ok: r.ok,
    status: r.status,
    ms: r.ms,
    detail: r.ok ? 'The REST surface answered — the ledger is reachable' : `Supabase answered ${r.status || 'nothing'}`,
    needs: r.ok ? '' : 'SUPABASE_URL + SUPABASE_SERVICE_KEY',
  });
}

async function bridgeNode(id, label, baseUrl, key, needs) {
  if (!baseUrl) return row(id, label, 'os', { needs });
  const started = Date.now();
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/functions/x1Bridge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-x1-bridge-key': key || '' },
      body: JSON.stringify({ action: 'heartbeat', worker: { name: 'x1-apex-factory', kind: 'factory' } }),
      signal: AbortSignal.timeout(TIMEBOX),
    });
    const body = await res.json().catch(() => null);
    const ms = Date.now() - started;
    return row(id, label, 'os', {
      inbound: true,
      outbound: res.ok,
      ok: res.ok,
      status: res.status,
      ms,
      detail: res.ok
        ? `Heartbeat accepted — worker ${body?.worker_id || 'registered'}, ${body?.queued ?? 0} queued`
        : `${body?.error || `answered ${res.status}`}`,
      needs: res.ok ? '' : needs,
    });
  } catch (err) {
    return row(id, label, 'os', {
      inbound: true,
      ok: false,
      ms: Date.now() - started,
      detail: String(err?.message || err).slice(0, 200),
      needs,
    });
  }
}

async function jarvisNode(baseUrl, key) {
  if (!baseUrl) return row('jarvis', 'Jarvis (local command)', 'local', { needs: 'JARVIS_BASE_URL' });
  const headers = key ? { Authorization: `Bearer ${key}` } : {};
  const r = await hit(`${baseUrl.replace(/\/$/, '')}/health`, { headers });
  return row('jarvis', 'Jarvis (local command)', 'local', {
    outbound: r.ok,
    ok: r.ok,
    status: r.status,
    ms: r.ms,
    detail: r.ok ? 'The local command service answered on /health' : `No answer (${r.status || 'unreachable'}) — the machine must be up and tunnelled`,
    needs: r.ok ? '' : 'JARVIS_BASE_URL (+ JARVIS_KEY if it asks for one)',
  });
}

export async function probeAll(secrets) {
  const key = secrets('X1_BRIDGE_KEY') || '';
  const nodes = await Promise.all([
    base44Node(key),
    mcpNode(),
    railwayNode(secrets('RAILWAY_API_KEY') || ''),
    vercelNode(secrets('VERCEL_API_KEY') || ''),
    supabaseNode(secrets('SUPABASE_URL') || '', secrets('SUPABASE_SERVICE_KEY') || ''),
    bridgeNode('os', 'Strategic Minds AI OS', secrets('X1_OS_BASE_URL') || '', key, 'X1_OS_BASE_URL'),
    bridgeNode('os_local', 'Strategic Minds AI OS (local)', secrets('OS_LOCAL_BASE_URL') || '', key, 'OS_LOCAL_BASE_URL'),
    jarvisNode(secrets('JARVIS_BASE_URL') || '', secrets('JARVIS_KEY') || ''),
  ]);
  const ok = nodes.filter((n) => n.ok).length;
  return {
    nodes,
    ok,
    total: nodes.length,
    score: Math.round((ok / nodes.length) * 100),
    checked_at: new Date().toISOString(),
  };
}