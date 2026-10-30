import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { RAILWAY, ensureHost, hostCall, hostSource, hostUrl, railwayGraphQL } from '../../shared/browserHost.ts';
import { countRows } from '../../shared/hostStore.ts';

const TABLES = ['host_session', 'host_run', 'host_usage', 'host_audit'];

const DDL = `
create table if not exists public.host_session (
  id text primary key,
  project_id text,
  status text not null default 'RUNNING',
  context_id text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  minutes numeric not null default 0,
  action_count integer not null default 0,
  meta jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.host_run (
  id text primary key,
  session_id text,
  agent_id text,
  task text,
  status text not null default 'RUNNING',
  output jsonb,
  steps jsonb,
  error text,
  started_at timestamptz,
  ended_at timestamptz,
  updated_at timestamptz not null default now()
);
create table if not exists public.host_usage (
  day date primary key,
  minutes numeric not null default 0,
  sessions integer not null default 0,
  actions integer not null default 0,
  updated_at timestamptz not null default now()
);
create table if not exists public.host_audit (
  id bigserial primary key,
  actor text,
  action text not null,
  target text,
  ok boolean not null default true,
  detail jsonb,
  at timestamptz not null default now()
);
create index if not exists host_audit_at_idx on public.host_audit (at desc);
create index if not exists host_session_started_idx on public.host_session (started_at desc);
create index if not exists host_run_started_idx on public.host_run (started_at desc);
alter table public.host_session enable row level security;
alter table public.host_run enable row level security;
alter table public.host_usage enable row level security;
alter table public.host_audit enable row level security;
insert into storage.buckets (id, name, public) values ('host-screenshots', 'host-screenshots', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('host-downloads', 'host-downloads', false) on conflict (id) do nothing;
`;

function supabaseRef() {
  const url = secrets.get('SUPABASE_URL');
  if (!url) return null;
  return String(url).replace(/^https:\/\//, '').split('.')[0];
}

async function migrate() {
  const token = secrets.get('SUPABASE_ACCESS_TOKEN');
  const ref = supabaseRef();
  if (!token || !ref) return { ok: false, error: 'SUPABASE_ACCESS_TOKEN or SUPABASE_URL is missing' };
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: DDL }),
    signal: AbortSignal.timeout(40000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false, error: JSON.stringify(body).slice(0, 400) };
  const counts = {};
  for (const table of TABLES) counts[table] = await countRows(table);
  return { ok: true, project: ref, tables: TABLES, counts };
}

async function railwayState() {
  const result = await railwayGraphQL(
    `query($s:String!,$e:String!){ serviceInstance(serviceId:$s, environmentId:$e){ latestDeployment { id status createdAt url } } }`,
    { s: RAILWAY.serviceId, e: RAILWAY.environmentId }
  );
  if (!result.ok) return { ok: false, error: result.errors?.map((e) => e.message).join('; ') || 'Railway query failed' };
  return { ok: true, deployment: result.data.serviceInstance?.latestDeployment || null };
}

async function health() {
  const usage = await hostCall('usage.get', {});
  return { ok: usage.ok, status: usage.status, usage: usage.ok ? usage.data : null, error: usage.error || null };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

    const payload = await req.json().catch(() => ({}));
    const action = payload.action || 'status';
    await ensureHost();

    if (action === 'status') {
      const [rail, probe] = await Promise.all([railwayState(), health().catch((e) => ({ ok: false, error: e.message }))]);
      const counts = {};
      for (const table of TABLES) counts[table] = await countRows(table);
      const record = {
        host_url: hostUrl() || '',
        project_id: RAILWAY.projectId,
        project_name: RAILWAY.projectName,
        environment_id: RAILWAY.environmentId,
        service_id: RAILWAY.serviceId,
        service_name: RAILWAY.serviceName,
        domain: hostUrl() ? hostUrl().replace(/^https:\/\//, '') : undefined,
        status: probe.ok ? 'healthy' : 'failed',
        last_deploy_id: rail.ok ? rail.deployment?.id : undefined,
        last_deploy_status: rail.ok ? rail.deployment?.status : undefined,
        last_checked_at: new Date().toISOString(),
        notes: `resolved via ${hostSource() || 'nothing'}`,
      };
      const page = await base44.entities.BrowserHostConfig.filter({}, { sort: '-created_date', limit: 1 });
      const items = page.items || [];
      const saved = items.length
        ? await base44.entities.BrowserHostConfig.update(items[0].id, record)
        : await base44.entities.BrowserHostConfig.create(record);
      return Response.json({
        ok: true,
        action,
        data: {
          host_url: hostUrl(),
          host_source: hostSource(),
          healthy: probe.ok,
          host: probe.usage,
          railway: rail.ok ? rail.deployment : { error: rail.error },
          tables: counts,
          checked_at: record.last_checked_at,
        },
        record: saved,
      });
    }

    if (action === 'railway.up') {
      const deploy = await railwayGraphQL(
        `mutation($s:String!,$e:String!){ serviceInstanceDeployV2(serviceId:$s, environmentId:$e) }`,
        { s: RAILWAY.serviceId, e: RAILWAY.environmentId }
      );
      if (!deploy.ok) return Response.json({ ok: false, action, error: deploy.errors?.map((e) => e.message).join('; ') }, { status: 502 });
      await new Promise((resolve) => setTimeout(resolve, 45000));
      const state = await railwayState();
      const probe = await health().catch((e) => ({ ok: false, error: e.message }));
      return Response.json({
        ok: true,
        action,
        data: { deployment: state.ok ? state.deployment : null, healthy: probe.ok, host: probe.usage },
      });
    }

    if (action === 'supabase.migrate') {
      const result = await migrate();
      return Response.json({ ...result, action }, { status: result.ok ? 200 : 502 });
    }

    if (action === 'verify.all') {
      const steps = [];
      const before = await health();
      steps.push({ step: 'health', ok: before.ok, detail: before.usage });

      const created = await hostCall('sessions.create', { timeout_seconds: 180 });
      const sessionId = created.ok ? created.data?.id : null;
      steps.push({ step: 'sessions.create', ok: created.ok && Boolean(sessionId), detail: sessionId || created.error });

      if (sessionId) {
        const navigated = await hostCall('sessions.act', { session_id: sessionId, page_action: 'goto', url: 'https://example.com' });
        steps.push({ step: 'goto example.com', ok: navigated.ok, detail: navigated.ok ? navigated.data?.url || navigated.data?.title : navigated.error });

        const read = await hostCall('sessions.act', { session_id: sessionId, page_action: 'extract_text', selector: 'body', limit: 160 });
        steps.push({ step: 'read page', ok: read.ok, detail: read.ok ? String(read.data?.result?.text || read.data?.text || '').slice(0, 80) : read.error });

        const frame = await hostCall('sessions.debug', { session_id: sessionId });
        steps.push({ step: 'live view', ok: frame.ok, detail: frame.ok ? 'frame served' : frame.error });

        const released = await hostCall('sessions.release', { session_id: sessionId });
        steps.push({ step: 'release', ok: released.ok, detail: released.ok ? released.data?.status : released.error });
      }

      const after = await health();
      steps.push({ step: 'usage', ok: after.ok, detail: after.usage });
      return Response.json({ ok: steps.every((s) => s.ok), action, data: { steps } });
    }

    return Response.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}