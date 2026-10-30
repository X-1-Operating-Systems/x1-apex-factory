import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { callLiveAvatar, EDEN_AVATAR_ID, SANDBOX_AVATAR_ID } from '../../shared/liveavatar.ts';

// One live Eden room that survives the vendor's per-session ceiling. LiveAvatar caps a session at
// 20 minutes (60 seconds in its sandbox), so "persistent" here means the app rolls a fresh session
// over a few seconds before the old one expires, and every device joins whatever room is current.
// Her own avatar, trained from her artwork. The sandbox avatar is only a fallback if that fails.
const AVATAR_ID = secrets.get('EDEN_LIVEAVATAR_AVATAR_ID') || EDEN_AVATAR_ID || SANDBOX_AVATAR_ID;
const EDEN_CONTEXT_ID = '58a8223a-bbb7-4bff-99d3-0322661d3588';
const LIVE_CAP_SECONDS = 1200;
const SANDBOX_CAP_SECONDS = 60;
const RENEW_BELOW_SECONDS = 45;

const secondsLeft = (record) => {
  if (!record?.expires_at) return 0;
  const left = (Date.parse(record.expires_at) - Date.now()) / 1000;
  return Number.isFinite(left) ? Math.round(left) : 0;
};

const view = (record, credits) => {
  if (!record) return { session: null, credits };
  return {
    credits,
    session: {
      id: record.id,
      session_id: record.session_id,
      started_at: record.started_at,
      expires_at: record.expires_at,
      seconds_left: Math.max(0, secondsLeft(record)),
      livekit_url: record.livekit_url,
      client_token: record.client_token,
      mode: record.mode,
      is_sandbox: record.is_sandbox === true,
      renewals: record.renewals || 0,
    },
  };
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ ok: false, error: 'The live avatar is admin-only.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = typeof body.action === 'string' ? body.action : 'state';
    // OWNER SAFETY HOLD 2026-10-30: do not mint tokens, start, or automatically renew
    // any LiveAvatar session. The prior UI invoked keep every 15 seconds without
    // specific per-session authorization. Keep stop/state accessible for cleanup.
    if (action === 'keep') {
      return Response.json({ ok: false, error: 'LiveAvatar session creation and automatic renewals are paused pending explicit owner approval.', paused: true }, { status: 423 });
    }
    const apiKey = secrets.get('LIVEAVATAR_API_KEY');
    if (!apiKey) return Response.json({ ok: false, error: 'LIVEAVATAR_API_KEY is not configured.' }, { status: 400 });

    const open = async () => {
      const page = await base44.entities.LiveSession.filter(
        { provider: 'liveavatar', persistent: true, status: 'started' },
        { sort: '-created_date', limit: 5 },
      );
      return page.items || [];
    };

    const endSession = async (record) => {
      if (record.session_token) {
        await callLiveAvatar(
          'sessions.stop',
          { session_token: record.session_token, session_id: record.session_id },
          apiKey,
        ).catch(() => null);
      }
      await base44.entities.LiveSession.update(record.id, {
        status: 'ended',
        ended_at: new Date().toISOString(),
        session_token: '',
      }).catch(() => null);
    };

    const readCredits = async () => {
      const res = await callLiveAvatar('credits.get', {}, apiKey);
      const left = res?.ok ? (res.data?.data ?? res.data)?.credits_left : null;
      return Number.isFinite(Number(left)) ? Number(left) : null;
    };

    if (action === 'state') {
      const sessions = await open();
      const current = sessions.find((record) => secondsLeft(record) > 0) || null;
      const stale = sessions.filter((record) => record.id !== current?.id);
      for (const record of stale) await base44.entities.LiveSession.update(record.id, { status: 'ended', ended_at: new Date().toISOString() }).catch(() => null);
      return Response.json({ ok: true, ...view(current, await readCredits()) });
    }

    if (action === 'stop') {
      const sessions = await open();
      for (const record of sessions) await endSession(record);
      return Response.json({ ok: true, stopped: sessions.length, ...view(null, await readCredits()) });
    }

    if (action !== 'keep') {
      return Response.json({ ok: false, error: `Unknown action "${action}".` }, { status: 400 });
    }

    // keep: roll the room over before it lapses, so she is continuously there.
    const sandbox = body.sandbox === true;
    const sessions = await open();
    const usable = [];
    for (const record of sessions) {
      if (secondsLeft(record) > RENEW_BELOW_SECONDS) usable.push(record);
      else await endSession(record);
    }

    const current = usable[0];
    if (current) return Response.json({ ok: true, kept: true, ...view(current, await readCredits()) });

    const cap = sandbox ? SANDBOX_CAP_SECONDS : LIVE_CAP_SECONDS;
    const tokenRes = await callLiveAvatar(
      'sessions.token',
      {
        avatar_id: AVATAR_ID,
        mode: 'FULL',
        is_sandbox: sandbox,
        context_id: EDEN_CONTEXT_ID,
        max_session_duration: cap,
      },
      apiKey,
    );
    if (!tokenRes.ok) {
      return Response.json({ ok: false, error: tokenRes.error || `LiveAvatar refused the token (${tokenRes.status}).` }, { status: 400 });
    }
    const sessionToken = (tokenRes.data?.data ?? tokenRes.data)?.session_token;
    if (!sessionToken) return Response.json({ ok: false, error: 'LiveAvatar returned no session token.' }, { status: 400 });

    const startRes = await callLiveAvatar(
      'sessions.start',
      { session_token: sessionToken, avatar_id: AVATAR_ID, mode: 'FULL', is_sandbox: sandbox, context_id: EDEN_CONTEXT_ID },
      apiKey,
    );
    if (!startRes.ok) {
      return Response.json({ ok: false, error: startRes.error || `The session did not start (${startRes.status}).` }, { status: 400 });
    }
    const started = startRes.data?.data ?? startRes.data ?? {};

    const record = await base44.entities.LiveSession.create({
      provider: 'liveavatar',
      session_id: String(started.session_id),
      context_id: EDEN_CONTEXT_ID,
      avatar_id: AVATAR_ID,
      mode: 'FULL',
      status: 'started',
      persistent: true,
      is_sandbox: sandbox,
      livekit_url: started.livekit_url || '',
      client_token: started.livekit_client_token || '',
      session_token: sessionToken,
      started_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + cap * 1000).toISOString(),
      renewals: Number(body.renewals) || 0,
      note: sandbox ? 'Persistent room (sandbox, free)' : 'Persistent room, billing per minute',
    });

    return Response.json({ ok: true, started: true, ...view(record, await readCredits()) });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || 'The live room failed.' }, { status: 500 });
  }
}