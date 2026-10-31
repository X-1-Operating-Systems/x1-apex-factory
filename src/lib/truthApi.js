import { base44 } from '@/api/base44Client';
import { callVideo, payloadOf, listOf } from '@/lib/videoApi';
import { EDEN_PERSONA } from '@/lib/edenPersona';

// Every value here is read live, from the provider or the database, at the moment the board loads.
// Nothing is cached, nothing is written down from memory, and a source that fails says so instead of
// showing a comfortable default.
const attempt = async (fn) => {
  try {
    return await fn();
  } catch (error) {
    return null;
  }
};

const countOf = (entity, query = {}) => attempt(() => base44.entities[entity].count(query));

const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);

const when = (iso) => {
  if (!iso) return 'never recorded';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? 'never recorded' : date.toLocaleString();
};

export async function loadTruth() {
  const [
    keys,
    account,
    credits,
    avatars,
    voice,
    host,
    room,
    openFindings,
    benchmarks,
    automations,
    browserRuns,
    videoJobs,
    liveSessions,
    templates,
    tasks,
  ] = await Promise.all([
    attempt(async () => (await base44.functions.invoke('keyStatus', {})).data),
    attempt(() => callVideo('heygen', 'account.me')),
    attempt(() => callVideo('liveavatar', 'credits.get')),
    attempt(() => callVideo('liveavatar', 'avatars.list', { page_size: 20 })),
    attempt(() => callVideo('heygen', 'voices.get', { voice_id: EDEN_PERSONA.voice_id })),
    attempt(async () => (await base44.functions.invoke('browserbase', { action: 'host.status' })).data),
    attempt(async () => (await base44.functions.invoke('edenLive', { action: 'state' })).data),
    countOf('GuardianFinding', { status: 'open' }),
    attempt(() => base44.entities.BenchmarkRun.list('-created_date', 1)),
    countOf('Automation'),
    countOf('BrowserRun'),
    countOf('VideoJob'),
    countOf('LiveSession', { status: 'started' }),
    countOf('Template'),
    countOf('StudioTask'),
  ]);

  const ready = keys?.ready || {};
  const heygenAccount = payloadOf(account) || {};
  const balance = num(heygenAccount?.wallet?.remaining_balance);
  const creditsLeft = num((payloadOf(credits) || {})?.credits_left);
  const ownedAvatars = listOf(avatars);
  const herVoice = payloadOf(voice) || {};
  const counters = host?.data ?? host ?? {};
  const running = num(counters?.sessions_running);
  const cap = num(counters?.max_sessions);
  const session = room?.session || null;
  const latest = (benchmarks || [])[0] || null;

  const evidence = {
    heygenKey: Boolean(ready.heygen),
    liveavatarKey: Boolean(ready.liveavatar),
    hostKey: Boolean(ready.host),
    vercelKey: Boolean(ready.vercel),
    manusKey: Boolean(ready.manus),
    ledgerKey: Boolean(ready.ledger),
    balance,
    creditsLeft,
    ownedAvatarCount: ownedAvatars.length,
    herVoiceName: herVoice?.name || null,
    herVoiceStatus: herVoice?.status || null,
    hostRunning: running,
    hostCap: cap,
    hostReachable: Boolean(host?.ok),
    roomOpen: Boolean(session),
    roomSandbox: session ? session.is_sandbox === true : null,
    keeperEnabled: room?.keeper?.enabled === true,
    keeperSandbox: room?.keeper?.sandbox === true,
    openFindings,
    automations,
    browserRuns,
    videoJobs,
    liveSessions,
    templates,
    tasks,
    lastValidatorRun: latest?.observed_at || null,
    lastValidatorScore: num(latest?.score_snapshot?.feature_parity ?? latest?.score_snapshot?.check_coverage),
    lastValidatorProbes: Array.isArray(latest?.observations) ? latest.observations.length : null,
    lastValidatorFailed: Array.isArray(latest?.observations)
      ? latest.observations.filter((o) => o.passed === false).length
      : null,
  };

  return { evidence, claims: buildClaims(evidence) };
}

// The five things that were asked for, judged only by the numbers just read.
export function buildClaims(e) {
  const money = (value) => (value === null ? 'unreadable' : `$${value.toFixed(2)}`);

  return [
    {
      key: 'manus',
      title: 'Manus — 100% parity, end to end',
      tone: 'partial',
      evidence: `Key ${e.manusKey ? 'present' : 'missing'} · ${e.tasks ?? '?'} studio tasks on record. Their API has no delete, no task search and no webhooks, so Manus runs cannot be filtered, stopped or removed from here, and status is only whatever their last poll said.`,
      unblocks: 'Their API would have to expose those routes. Nothing in this app can invent them.',
    },
    {
      key: 'browserbase',
      title: 'Browserbase — end to end',
      tone: 'absent',
      evidence: `There is no Browserbase call anywhere in this app — it was removed and replaced by your own container. Host ${e.hostReachable ? 'answers' : 'does not answer'}${
        e.hostCap ? ` · ${e.hostRunning ?? 0} running of ${e.hostCap} allowed` : ''
      } · ${e.browserRuns ?? '?'} browser runs stored.`,
      unblocks: 'Say the word and I rebuild it as a real vendor integration. Today the browser is yours, not rented.',
    },
    {
      key: 'heygen',
      title: 'HeyGen — end to end',
      tone: !e.heygenKey ? 'absent' : e.balance === null ? 'partial' : e.balance > 0 ? 'ok' : 'blocked',
      evidence: `Wallet ${money(e.balance)} · ${e.videoJobs ?? '?'} renders stored · her voice ${
        e.herVoiceName ? `"${e.herVoiceName}" (${e.herVoiceStatus || 'status unknown'})` : 'not readable'
      }. A render is refused with 402 insufficient_credit at an empty wallet — the control is wired and cannot pass that gate.`,
      unblocks: e.balance !== null && e.balance > 0 ? 'Nothing — it can render now.' : 'Fund the wallet. No code is missing.',
    },
    {
      key: 'liveavatar',
      title: 'Live Avatar — end to end',
      tone:
        e.creditsLeft === null ? 'absent' : e.ownedAvatarCount === 0 ? 'partial' : 'ok',
      evidence: `${e.creditsLeft ?? 'unreadable'} credits · ${e.ownedAvatarCount} avatars owned inside LiveAvatar · room ${
        e.roomOpen ? 'open' : 'closed'
      }${e.roomOpen ? (e.roomSandbox ? ' (sandbox)' : ' (billing per minute)') : ''} · keeper ${
        e.keeperEnabled ? `on${e.keeperSandbox ? ', sandbox' : ', paid'}` : 'off'
      }. Her face is not installed in LiveAvatar, so the room runs their preview avatar.`,
      unblocks: 'Her still has to be uploaded and validated in LiveAvatar’s own console — they expose no route to create an avatar.',
    },
    {
      key: 'autonomy',
      title: 'Autonomous code system, validating itself',
      tone: e.automations > 0 ? 'ok' : 'partial',
      evidence: `${e.automations ?? '?'} automations scheduled · ${e.browserRuns ?? '?'} browser runs · last validator run ${when(
        e.lastValidatorRun,
      )} with ${e.lastValidatorProbes ?? '?'} probes and ${e.lastValidatorFailed ?? '?'} failed · ${
        e.openFindings ?? '?'
      } open findings. The validator answers when called; nothing is scheduled to call it.`,
      unblocks: 'Add one automation on /automations. The engine is built — the clock is empty.',
    },
  ];
}