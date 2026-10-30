import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { callHeyGen, heygenRegistry } from '../../shared/heygen.ts';
import { callLiveAvatar, liveAvatarRegistry } from '../../shared/liveavatar.ts';

const KEY_FOR = { heygen: 'HEYGEN_API_KEY', liveavatar: 'LIVEAVATAR_API_KEY' };

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ ok: false, error: 'The video surface is admin-only.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const provider = body.provider === 'liveavatar' ? 'liveavatar' : body.provider === 'heygen' ? 'heygen' : null;
    const action = typeof body.action === 'string' ? body.action : '';
    const input = body.input && typeof body.input === 'object' ? body.input : {};

    if (!provider) {
      return Response.json(
        { ok: false, error: 'provider must be "heygen" or "liveavatar".' },
        { status: 400 },
      );
    }

    // OWNER SAFETY HOLD 2026-10-30: LiveAvatar account mutations require a fresh,
    // narrowly scoped owner approval. The agent previously started repeated sandbox
    // sessions automatically. Read-only inspections and explicit stop remain allowed.
    const liveAvatarReadOnly = new Set([
      'credits.get', 'languages.list', 'avatars.list', 'avatars.get',
      'voices.list', 'contexts.list', 'contexts.get', 'sessions.list',
      'sessions.get', 'sessions.transcript', 'sessions.stop',
    ]);
    if (provider === 'liveavatar' && !liveAvatarReadOnly.has(action) &&
        !['registry.list', 'registry.all'].includes(action)) {
      return Response.json({ ok: false, paused: true,
        error: 'LiveAvatar submissions, token creation and paid/sandbox sessions are paused until separately approved by the owner.' },
        { status: 423 });
    }

    if (action === 'registry.list') {
      return Response.json({
        ok: true,
        provider,
        data: provider === 'heygen' ? heygenRegistry() : liveAvatarRegistry(),
      });
    }
    if (action === 'registry.all') {
      return Response.json({
        ok: true,
        data: { heygen: heygenRegistry(), liveavatar: liveAvatarRegistry() },
      });
    }

    const registry = provider === 'heygen' ? heygenRegistry() : liveAvatarRegistry();
    const spec = registry.find((entry) => entry.action === action);
    if (!spec) {
      return Response.json(
        { ok: false, provider, action, error: `Unknown ${provider} action "${action}".` },
        { status: 404 },
      );
    }

    if (spec.confirm && body.confirm !== true) {
      return Response.json(
        {
          ok: false,
          needs_confirmation: true,
          provider,
          action,
          message: `${action} costs money or destroys something. Resend with confirm: true.`,
        },
        { status: 409 },
      );
    }

    const apiKey = secrets.get(KEY_FOR[provider]);
    if (!apiKey) {
      return Response.json(
        { ok: false, provider, action, error: `${KEY_FOR[provider]} is not configured.` },
        { status: 400 },
      );
    }

    const result =
      provider === 'heygen'
        ? await callHeyGen(action, input, apiKey)
        : await callLiveAvatar(action, input, apiKey);

    if (!result.ok) {
      return Response.json({
        ok: false,
        provider,
        action,
        status: result.status,
        verified: result.verified,
        error: result.error || result.data?.error?.message || result.data?.message || `HTTP ${result.status}`,
        data: result.data,
      });
    }

    const record = await remember(base44, provider, action, input, result.data, user);

    return Response.json({
      ok: true,
      provider,
      action,
      verified: result.verified,
      record,
      data: result.data,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || 'The request failed.' }, { status: 500 });
  }
}

// Bookkeeping is best effort: the API's own answer is the result, and a failed write must not
// turn a successful render or session into an error.
async function remember(base44, provider, action, input, data, user) {
  const payload = data?.data ?? data ?? {};

  if (provider === 'heygen' && action === 'videos.create') {
    const jobId = payload.video_id || payload.videoId;
    if (!jobId) return null;
    return base44.entities.VideoJob.create({
      provider: 'heygen',
      job_id: String(jobId),
      kind: 'avatar_video',
      title: input.title ? String(input.title).slice(0, 140) : 'Untitled video',
      status: 'submitted',
      avatar_id: input.avatar_id ? String(input.avatar_id) : '',
      voice_id: input.voice_id ? String(input.voice_id) : '',
      script: input.script ? String(input.script).slice(0, 2000) : '',
      ratio: input.ratio || '16:9',
      note: `Submitted by ${user.email}`,
    }).catch(() => null);
  }

  if (provider === 'heygen' && action === 'template.generate') {
    const jobId = payload.video_id || payload.videoId;
    if (!jobId) return null;
    return base44.entities.VideoJob.create({
      provider: 'heygen',
      job_id: String(jobId),
      kind: 'template',
      title: input.template_id ? `Template ${input.template_id}` : 'Template render',
      status: 'submitted',
      note: `Submitted by ${user.email}`,
    }).catch(() => null);
  }

  if (provider === 'heygen' && action === 'videos.get') {
    const jobId = String(input.video_id);
    const page = await base44.entities.VideoJob
      .filter({ job_id: jobId }, { sort: '-created_date', limit: 1 })
      .catch(() => null);
    const job = page?.items?.[0];
    if (!job) return null;
    return base44.entities.VideoJob.update(job.id, {
      status: payload.status ? String(payload.status) : job.status,
      video_url: payload.video_url || payload.videoUrl || job.video_url || '',
      thumbnail_url: payload.thumbnail_url || job.thumbnail_url || '',
      duration: Number(payload.duration) || job.duration || 0,
      error: payload.error ? String(payload.error) : '',
    }).catch(() => null);
  }

  if (provider === 'liveavatar' && action === 'sessions.start') {
    const sessionId = payload.session_id || payload.id;
    if (!sessionId) return null;
    return base44.entities.LiveSession.create({
      provider: 'liveavatar',
      session_id: String(sessionId),
      context_id: input.context_id ? String(input.context_id) : '',
      avatar_id: input.avatar_id ? String(input.avatar_id) : '',
      mode: input.mode === 'LITE' ? 'LITE' : 'FULL',
      status: 'started',
      started_at: new Date().toISOString(),
      note: input.is_sandbox === true ? 'Sandbox session, no credits used' : `Started by ${user.email}`,
    }).catch(() => null);
  }

  if (provider === 'liveavatar' && action === 'sessions.stop') {
    // Stopping is authenticated by the session token alone, so the id may not be supplied:
    // fall back to the most recent session still marked started.
    const query = input.session_id ? { session_id: String(input.session_id) } : { status: 'started' };
    const page = await base44.entities.LiveSession
      .filter(query, { sort: '-created_date', limit: 1 })
      .catch(() => null);
    const session = page?.items?.[0];
    if (!session) return null;
    return base44.entities.LiveSession.update(session.id, {
      status: 'ended',
      ended_at: new Date().toISOString(),
    }).catch(() => null);
  }

  return null;
}