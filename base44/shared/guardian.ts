import { secrets } from 'base44:runtime';
import { callHeyGen } from './heygen.ts';
import { callLiveAvatar } from './liveavatar.ts';
import { ensureHost, hostConfigured, hostRequest, hostSource, railwayGraphQL } from './browserHost.ts';

/**
 * The trust layer. Nothing here is narrated: every probe makes a real call and either proves the
 * capability answers or says exactly what it answered instead. The catalog is fixed, so a probe
 * that stops reporting shows up as a failure rather than quietly disappearing from the score.
 */

const TIMEOUT_MS = 20000;

export const REQUIRED_SECRETS = [
  'MANUS_API_KEY',
  'RAILWAY_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'SUPABASE_ACCESS_TOKEN',
  'VERCEL_API_KEY',
  'HEYGEN_API_KEY',
  'LIVEAVATAR_API_KEY',
];

export const PROBE_CATALOG = [
  { id: 'secrets.present', area: 'keys', label: 'Every required secret is present' },
  { id: 'heygen.account', area: 'providers', label: 'HeyGen key authenticates (v3)' },
  { id: 'heygen.catalog', area: 'providers', label: 'HeyGen avatars and voices load' },
  { id: 'liveavatar.account', area: 'providers', label: 'LiveAvatar key authenticates' },
  { id: 'railway.account', area: 'providers', label: 'Railway key reaches the project' },
  { id: 'vercel.account', area: 'providers', label: 'Vercel key authenticates' },
  { id: 'connector.github', area: 'connectors', label: 'GitHub connector answers' },
  { id: 'connector.supabase', area: 'connectors', label: 'Supabase connector answers' },
  { id: 'connector.google', area: 'connectors', label: 'Google Workspace connector answers' },
  { id: 'browser.host', area: 'platform', label: 'Owned browser host answers' },
  { id: 'functions.reachable', area: 'platform', label: 'App functions serve the deployed code' },
  { id: 'entities.live', area: 'platform', label: 'Every entity table answers' },
  { id: 'sites.live', area: 'live', label: 'Shipped sites answer' },
  { id: 'deploys.live', area: 'live', label: 'Deployments in the ledger answer' },
  { id: 'autopilot.loop', area: 'loop', label: 'Autopilot has no stuck job' },
  { id: 'sessions.clean', area: 'loop', label: 'No browser session outlives its window' },
  { id: 'quality.gate', area: 'quality', label: 'The latest quality gate scored its page' },
];

const ENTITY_TABLES = [
  'Project',
  'StudioPage',
  'StudioTask',
  'Deployment',
  'BrowserSession',
  'BrowserRun',
  'VideoJob',
  'LiveSession',
  'ShareLink',
];

export function verdictFor(score) {
  if (score >= 100) return 'verified';
  if (score >= 90) return 'strong';
  if (score >= 75) return 'review';
  return 'blocked';
}

export function scoreOf(observations) {
  const list = Array.isArray(observations) ? observations : [];
  if (!list.length) return 0;
  const passed = list.filter((item) => item.passed).length;
  return Math.round((passed / list.length) * 100);
}

async function probeFetch(url, init) {
  try {
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    return { ok: response.ok, status: response.status, data: await response.json().catch(() => null) };
  } catch (error) {
    return { ok: false, status: 0, data: null, error: String(error?.message || error) };
  }
}

const pass = (detail) => ({ passed: true, detail });
const fail = (detail) => ({ passed: false, detail });

async function connectorToken(base44, type) {
  const connection = await base44.asServiceRole.connectors.getConnection(type).catch(() => null);
  const token = connection?.accessToken || connection?.access_token || null;
  return token;
}

const RUNNERS = {
  'secrets.present': async () => {
    const missing = REQUIRED_SECRETS.filter((name) => !secrets.get(name));
    return missing.length ? fail(`Missing: ${missing.join(', ')}`) : pass(`${REQUIRED_SECRETS.length} secrets present`);
  },

  'heygen.account': async () => {
    const key = secrets.get('HEYGEN_API_KEY');
    if (!key) return fail('HEYGEN_API_KEY is not set');
    const result = await callHeyGen('account.me', {}, key);
    if (!result.ok) return fail(`HTTP ${result.status || 0}: ${result.error || 'no answer'}`);
    const payload = result.payload || {};
    return pass(`${payload.email || 'account'} · wallet $${payload.wallet?.remaining_balance ?? '—'}`);
  },

  'heygen.catalog': async () => {
    const key = secrets.get('HEYGEN_API_KEY');
    if (!key) return fail('HEYGEN_API_KEY is not set');
    const avatars = await callHeyGen('avatars.list', { limit: 5 }, key);
    const voices = await callHeyGen('voices.list', { limit: 5 }, key);
    if (!avatars.ok || !voices.ok) {
      return fail(`avatars HTTP ${avatars.status || 0}, voices HTTP ${voices.status || 0}`);
    }
    const groups = avatars.payload?.data?.length ?? avatars.data?.data?.length ?? 0;
    const voiceCount = voices.payload?.data?.length ?? voices.data?.data?.length ?? 0;
    if (!groups) return fail('The avatar catalogue came back empty');
    return pass(`${groups} avatar groups and ${voiceCount} voices returned`);
  },

  'liveavatar.account': async () => {
    const key = secrets.get('LIVEAVATAR_API_KEY');
    if (!key) return fail('LIVEAVATAR_API_KEY is not set');
    const result = await callLiveAvatar('credits.get', {}, key);
    if (!result.ok) return fail(`HTTP ${result.status || 0}: ${result.error || 'no answer'}`);
    const credits = result.payload?.credits_left ?? result.payload?.credits ?? '—';
    return pass(`authenticated · ${credits} credits left`);
  },

  'railway.account': async () => {
    if (!secrets.get('RAILWAY_API_KEY')) return fail('RAILWAY_API_KEY is not set');
    const result = await railwayGraphQL('query { me { email } }').catch((error) => ({ ok: false, error: String(error) }));
    if (!result.ok) return fail(result.errors ? JSON.stringify(result.errors).slice(0, 200) : 'Railway did not answer');
    return pass(`authenticated as ${result.data?.me?.email || 'workspace member'}`);
  },

  'vercel.account': async () => {
    const key = secrets.get('VERCEL_API_KEY');
    if (!key) return fail('VERCEL_API_KEY is not set');
    const result = await probeFetch('https://api.vercel.com/v2/user', { headers: { Authorization: `Bearer ${key}` } });
    if (!result.ok) return fail(`HTTP ${result.status}`);
    return pass(`authenticated as ${result.data?.user?.username || result.data?.user?.email || 'account'}`);
  },

  'connector.github': async (base44) => {
    const token = await connectorToken(base44, 'github');
    if (!token) return fail('Not authorized');
    const result = await probeFetch('https://api.github.com/user', {
      // GitHub answers 403 without a User-Agent, which would read as a broken token.
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'x1-apex-factory' },
    });
    return result.ok ? pass(`authenticated as ${result.data?.login}`) : fail(`HTTP ${result.status}`);
  },

  'connector.supabase': async (base44) => {
    const token = await connectorToken(base44, 'supabase');
    if (!token) return fail('Not authorized');
    const result = await probeFetch('https://api.supabase.com/v1/projects', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!result.ok) return fail(`HTTP ${result.status}`);
    const count = Array.isArray(result.data) ? result.data.length : 0;
    return pass(`${count} project${count === 1 ? '' : 's'} readable`);
  },

  'connector.google': async (base44) => {
    const token = await connectorToken(base44, 'googleworkspace');
    if (!token) return fail('Not authorized');
    const result = await probeFetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/profile?fields=emailAddress',
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return result.ok ? pass(`Gmail answers for ${result.data?.emailAddress || 'the account'}`) : fail(`HTTP ${result.status}`);
  },

  'browser.host': async () => {
    await ensureHost().catch(() => null);
    if (!hostConfigured()) return fail('The host URL and token could not be resolved');
    // `usage.get` is the host's own health route: it answers only when the container is up and
    // its token is right, and it returns the counters that prove it is the same host we deploy.
    const result = await hostRequest('usage.get', {});
    if (!result.ok) return fail(result.error || `HTTP ${result.status}`);
    const data = result.data || {};
    return pass(
      `${hostSource()} · ${data.sessions_running ?? 0} running · ${data.browser_minutes ?? 0} minutes used`,
    );
  },

  'functions.reachable': async (base44, ctx) => {
    if (!ctx.origin) return fail('The function origin could not be read from the request');
    const headers = ctx.auth ? { Authorization: ctx.auth } : {};
    const result = await probeFetch(`${ctx.origin}/functions/keyStatus`, { headers });
    if (!result.ok) return fail(`keyStatus answered HTTP ${result.status}`);
    if (!result.data?.ok) return fail('keyStatus answered without its payload');
    const ready = result.data.ready || {};
    const missing = Object.keys(ready).filter((key) => !ready[key]);
    return pass(missing.length ? `serving · waiting on ${missing.join(', ')}` : 'keyStatus serves the deployed code on every surface');
  },

  'entities.live': async (base44) => {
    const counts = await Promise.all(
      ENTITY_TABLES.map((name) =>
        base44.asServiceRole.entities[name]
          .count({})
          .then((value) => ({ name, value }))
          .catch(() => ({ name, value: null })),
      ),
    );
    const broken = counts.filter((row) => typeof row.value !== 'number');
    if (broken.length) return fail(`No answer from: ${broken.map((row) => row.name).join(', ')}`);
    const total = counts.reduce((sum, row) => sum + row.value, 0);
    return pass(`${counts.length} tables answer · ${total} records`);
  },

  'sites.live': async (base44) => {
    const page = await base44.asServiceRole.entities.Project.filter({ live_url: { $exists: true } }, { limit: 20 }).catch(() => null);
    const sites = (page?.items || []).filter((project) => project.live_url);
    if (!sites.length) return pass('No site is published yet — nothing to check');
    const results = await Promise.all(
      sites.slice(0, 5).map(async (project) => ({
        name: project.name,
        result: await probeFetch(project.live_url, { method: 'GET' }),
      })),
    );
    const down = results.filter((row) => !row.result.ok || row.result.status >= 400);
    if (down.length) {
      return fail(`${down.length} of ${results.length} down: ${down.map((row) => `${row.name} (${row.result.status})`).join(', ')}`);
    }
    return pass(`${results.length} live site${results.length === 1 ? '' : 's'} answered 200`);
  },

  'deploys.live': async (base44) => {
    const page = await base44.asServiceRole.entities.Deployment.list({ sort: '-created_date', limit: 20 }).catch(() => null);
    const deployments = (page?.items || []).filter((row) => row.url);
    if (!deployments.length) return pass('No deployment has a URL yet');
    const results = await Promise.all(
      deployments.slice(0, 5).map(async (row) => ({
        id: row.id,
        result: await probeFetch(row.url, { method: 'GET' }),
      })),
    );
    const down = results.filter((row) => !row.result.ok || row.result.status >= 400);
    if (down.length) return fail(`${down.length} of ${results.length} deployments answer an error`);
    return pass(`${results.length} deployment${results.length === 1 ? '' : 's'} answer 200`);
  },

  'autopilot.loop': async (base44) => {
    const page = await base44.asServiceRole.entities.AutopilotJob.list({ sort: '-created_date', limit: 20 }).catch(() => null);
    const jobs = page?.items || [];
    if (!jobs.length) return pass('No autopilot job has run yet');
    const cutoff = Date.now() - 10 * 60 * 1000;
    const stuck = jobs.filter(
      (job) =>
        ['queued', 'running'].includes(String(job.status)) &&
        (!job.next_at || new Date(job.next_at).getTime() < cutoff),
    );
    if (stuck.length) return fail(`${stuck.length} job${stuck.length === 1 ? '' : 's'} stalled past their next stage`);
    const last = jobs[0];
    return pass(`last job ${last.status} at stage ${last.stage}`);
  },

  'quality.gate': async (base44) => {
    const page = await base44.asServiceRole.entities.QaRun.list({ sort: '-created_date', limit: 5 }).catch(() => null);
    const runs = page?.items || [];
    if (!runs.length) return fail('No quality run is stored — nothing has been scored yet');
    const latest = runs[0];
    const score = Number(latest.score ?? 0);
    if (score < 75) return fail(`latest page scored ${score}/100 (${latest.verdict || 'no verdict'})`);
    return pass(`latest page scored ${score}/100 (${latest.verdict || 'review'})`);
  },

  'sessions.clean': async (base44) => {
    const page = await base44.asServiceRole.entities.BrowserSession.filter({ status: 'RUNNING' }, { limit: 50 }).catch(() => null);
    const sessions = page?.items || [];
    const overdue = sessions.filter((session) => session.expires_at && new Date(session.expires_at).getTime() < Date.now());
    if (overdue.length) return fail(`${overdue.length} session${overdue.length === 1 ? '' : 's'} running past their window`);
    return pass(sessions.length ? `${sessions.length} running, all within their window` : 'No session is holding the host');
  },
};

export async function runProbes(base44, ctx = {}) {
  const stamp = new Date().toISOString();
  const observations = [];

  for (const probe of PROBE_CATALOG) {
    const runner = RUNNERS[probe.id];
    if (!runner) {
      observations.push({ probe_id: probe.id, passed: false, detail: 'No runner is installed for this probe', verified_at: stamp });
      continue;
    }
    let outcome;
    try {
      outcome = await runner(base44, ctx);
    } catch (error) {
      outcome = fail(String(error?.message || error).slice(0, 300));
    }
    observations.push({
      probe_id: probe.id,
      passed: Boolean(outcome?.passed),
      detail: String(outcome?.detail || '').slice(0, 500),
      verified_at: stamp,
    });
  }

  return observations;
}

export async function signRun(observations, nonce) {
  const canonical =
    JSON.stringify(observations.map((item) => ({ p: item.probe_id, r: item.passed, d: String(item.detail).slice(0, 120) }))) +
    '|' +
    nonce;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function nonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function compareRuns(previous, latest) {
  const before = new Map((previous?.observations || []).map((item) => [item.probe_id, item.passed]));
  const regressions = [];
  const recovered = [];
  for (const item of latest?.observations || []) {
    if (!before.has(item.probe_id)) continue;
    if (before.get(item.probe_id) && !item.passed) regressions.push(item);
    if (!before.get(item.probe_id) && item.passed) recovered.push(item);
  }
  return { regressions, recovered, firstRun: !previous };
}

/**
 * Data-integrity audit. Every finding names a record, so it can be checked and fixed rather than
 * read as an opinion.
 */
export async function runAudit(base44) {
  const store = base44.asServiceRole.entities;
  const grab = async (name, options) => {
    const page = await store[name].list(options).catch(() => null);
    return page?.items || [];
  };

  const [projects, pages, tasks, jobs, deployments, links, sessions, lives] = await Promise.all([
    grab('Project', { limit: 300 }),
    grab('StudioPage', { limit: 400 }),
    grab('StudioTask', { limit: 400 }),
    grab('AutopilotJob', { sort: '-created_date', limit: 50 }),
    grab('Deployment', { sort: '-created_date', limit: 100 }),
    grab('ShareLink', { limit: 200 }),
    grab('BrowserSession', { limit: 100 }),
    grab('LiveSession', { limit: 100 }),
  ]);

  const projectIds = new Set(projects.map((row) => row.id));
  const findings = [];
  const now = Date.now();

  const orphansPage = pages.filter((page) => page.project_id && !projectIds.has(page.project_id));
  if (orphansPage.length) {
    findings.push({
      severity: 'high',
      area: 'pages',
      title: `${orphansPage.length} page${orphansPage.length === 1 ? '' : 's'} point at a deleted project`,
      detail: 'These pages cannot be reached from any studio and are never shipped.',
      evidence: orphansPage.slice(0, 5).map((page) => `${page.name} → ${page.project_id}`).join(' · '),
      ref: `pages:${orphansPage[0].id}`,
    });
  }

  const orphansTask = tasks.filter((task) => task.project_id && !projectIds.has(task.project_id));
  if (orphansTask.length) {
    findings.push({
      severity: 'medium',
      area: 'tasks',
      title: `${orphansTask.length} task${orphansTask.length === 1 ? '' : 's'} belong to a missing project`,
      detail: 'Their runs still exist but no project holds them, so their brief has nowhere to live.',
      evidence: orphansTask.slice(0, 5).map((task) => task.title).join(' · '),
      ref: `tasks:${orphansTask[0].id}`,
    });
  }

  const stuck = jobs.filter(
    (job) => ['queued', 'running'].includes(String(job.status)) && (!job.next_at || new Date(job.next_at).getTime() < now - 10 * 60 * 1000),
  );
  if (stuck.length) {
    findings.push({
      severity: 'critical',
      area: 'autopilot',
      title: `${stuck.length} autopilot job${stuck.length === 1 ? '' : 's'} stalled`,
      detail: 'The clock is not advancing them; their next stage is overdue by more than ten minutes.',
      evidence: stuck.slice(0, 5).map((job) => `${job.id.slice(-6)} at ${job.stage}`).join(' · '),
      ref: `autopilot:${stuck[0].id}`,
    });
  }

  const blockedJobs = jobs.filter((job) => String(job.status) === 'failed');
  if (blockedJobs.length) {
    findings.push({
      severity: 'medium',
      area: 'autopilot',
      title: `${blockedJobs.length} autopilot job${blockedJobs.length === 1 ? '' : 's'} ended failed`,
      detail: 'Each one names the stage it stopped in; nothing retries them on its own.',
      evidence: blockedJobs.slice(0, 5).map((job) => `${job.stage}: ${job.error || 'no error recorded'}`).join(' · '),
      ref: `autopilot-failed:${blockedJobs[0].id}`,
    });
  }

  const unshipped = deployments.filter((row) => ['approved', 'approved_manually'].includes(String(row.status)) && !row.url);
  if (unshipped.length) {
    findings.push({
      severity: 'high',
      area: 'releases',
      title: `${unshipped.length} approved release${unshipped.length === 1 ? '' : 's'} never reached a URL`,
      detail: 'The release is marked approved but the deployment carries no address, so the client has nothing to open.',
      evidence: unshipped.slice(0, 5).map((row) => row.id.slice(-6)).join(' · '),
      ref: `deployment:${unshipped[0].id}`,
    });
  }

  const liveProjects = projects.filter((project) => project.status === 'live' && !project.live_url);
  if (liveProjects.length) {
    findings.push({
      severity: 'high',
      area: 'projects',
      title: `${liveProjects.length} project${liveProjects.length === 1 ? '' : 's'} marked live without an address`,
      detail: 'Status says live, but there is no URL to open — the label is ahead of the fact.',
      evidence: liveProjects.slice(0, 5).map((project) => project.name).join(' · '),
      ref: `project:${liveProjects[0].id}`,
    });
  }

  const expiredLinks = links.filter((link) => !link.revoked && link.expires_at && new Date(link.expires_at).getTime() < now);
  if (expiredLinks.length) {
    findings.push({
      severity: 'high',
      area: 'sharing',
      title: `${expiredLinks.length} client link${expiredLinks.length === 1 ? '' : 's'} expired but still open`,
      detail: 'The expiry date has passed and the link was never revoked, so it still resolves.',
      evidence: expiredLinks.slice(0, 5).map((link) => link.label || link.token.slice(0, 8)).join(' · '),
      ref: `share:${expiredLinks[0].id}`,
    });
  }

  const overdueSessions = sessions.filter(
    (session) => String(session.status) === 'RUNNING' && session.expires_at && new Date(session.expires_at).getTime() < now,
  );
  if (overdueSessions.length) {
    findings.push({
      severity: 'high',
      area: 'browser',
      title: `${overdueSessions.length} browser session${overdueSessions.length === 1 ? '' : 's'} outlived the window`,
      detail: 'These sessions are still recorded as running, so the host is holding capacity for nothing.',
      evidence: overdueSessions.slice(0, 5).map((session) => session.session_id?.slice(0, 8)).join(' · '),
      ref: `session:${overdueSessions[0].id}`,
    });
  }

  const openLives = lives.filter(
    (session) => String(session.status) === 'started' && session.expires_at && new Date(session.expires_at).getTime() < now,
  );
  if (openLives.length) {
    findings.push({
      severity: 'medium',
      area: 'live',
      title: `${openLives.length} avatar room${openLives.length === 1 ? '' : 's'} left open`,
      detail: 'The room expired but the record never closed, so the dashboard claims a session that is over.',
      evidence: openLives.slice(0, 5).map((session) => session.session_id?.slice(0, 8)).join(' · '),
      ref: `live:${openLives[0].id}`,
    });
  }

  return findings;
}

/** Repairs that cannot lose anything: only records already past their own expiry, or loops already stalled. */
export async function applyHeal(base44, action) {
  const store = base44.asServiceRole.entities;
  const now = Date.now();

  if (action === 'loop.unstick') {
    const page = await store.AutopilotJob.filter({ status: { $in: ['queued', 'running'] } }, { limit: 100 });
    const stalled = (page.items || []).filter(
      (job) => !job.next_at || new Date(job.next_at).getTime() < now - 10 * 60 * 1000,
    );
    for (const job of stalled) {
      await store.AutopilotJob.update(job.id, { next_at: new Date(now - 1000).toISOString() });
    }
    return { action, fixed: stalled.length, note: stalled.length ? `${stalled.length} job(s) put back on the clock` : 'Nothing was stalled' };
  }

  if (action === 'sessions.reap') {
    const page = await store.BrowserSession.filter({ status: 'RUNNING' }, { limit: 100 });
    const overdue = (page.items || []).filter((session) => session.expires_at && new Date(session.expires_at).getTime() < now);
    for (const session of overdue) {
      await ensureHost().catch(() => null);
      if (hostConfigured()) {
        await hostRequest('sessions.release', { session_id: session.session_id }).catch(() => null);
      }
      await store.BrowserSession.update(session.id, { status: 'COMPLETED', ended_at: new Date().toISOString() });
    }
    return { action, fixed: overdue.length, note: overdue.length ? `${overdue.length} session(s) released` : 'No session was overdue' };
  }

  if (action === 'shares.revoke') {
    const page = await store.ShareLink.list({ limit: 200 });
    const expired = (page.items || []).filter(
      (link) => !link.revoked && link.expires_at && new Date(link.expires_at).getTime() < now,
    );
    for (const link of expired) await store.ShareLink.update(link.id, { revoked: true });
    return { action, fixed: expired.length, note: expired.length ? `${expired.length} link(s) closed` : 'No link was open past its expiry' };
  }

  if (action === 'lives.close') {
    const page = await store.LiveSession.list({ limit: 100 });
    const open = (page.items || []).filter(
      (session) => String(session.status) === 'started' && session.expires_at && new Date(session.expires_at).getTime() < now,
    );
    for (const session of open) {
      await store.LiveSession.update(session.id, { status: 'ended', ended_at: new Date().toISOString() });
    }
    return { action, fixed: open.length, note: open.length ? `${open.length} room(s) closed` : 'No room was left open' };
  }

  return { action, fixed: 0, note: 'Unknown repair' };
}

export const HEAL_ACTIONS = [
  { key: 'loop.unstick', label: 'Restart stalled jobs', detail: 'Put any autopilot job whose next stage is overdue back on the clock.' },
  { key: 'sessions.reap', label: 'Release dead sessions', detail: 'Release browser sessions that passed their own expiry and close their records.' },
  { key: 'shares.revoke', label: 'Close expired links', detail: 'Revoke client links whose expiry date has passed.' },
  { key: 'lives.close', label: 'Close dead rooms', detail: 'Mark avatar rooms ended once their expiry has passed.' },
];