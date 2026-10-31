import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  AVATAR_RAILWAY,
  ensureAvatarHost,
  avatarConfigured,
  avatarBytes,
  avatarJson,
  avatarSource,
  signedAvatarUrl,
  uploadAvatar,
} from '../../shared/avatarHost.ts';

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
// Renders already copied into app storage, so polling a finished job never uploads it twice.
const RENDER_FILES = new Map();

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

    const payload = await req.json().catch(() => ({}));
    const action = payload.action || 'status';
    await ensureAvatarHost();

    if (action === 'status') {
      if (!avatarConfigured()) {
        return Response.json({ ok: false, action, connected: false, source: avatarSource(), error: 'The avatar host is not reachable yet.' });
      }
      const health = await avatarJson('/health');
      return Response.json({
        ok: health.ok,
        action,
        connected: true,
        source: avatarSource(),
        host: health.data,
        error: health.error,
      });
    }

    if (action === 'image.set') {
      const url = String(payload.url || '').trim();
      if (!url) return Response.json({ ok: false, error: 'url is required' }, { status: 400 });
      const fetched = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!fetched.ok) return Response.json({ ok: false, error: `Could not read that image (HTTP ${fetched.status})` }, { status: 400 });
      const bytes = new Uint8Array(await fetched.arrayBuffer());
      if (!bytes.byteLength) return Response.json({ ok: false, error: 'That image was empty' }, { status: 400 });
      if (bytes.byteLength > MAX_IMAGE_BYTES) return Response.json({ ok: false, error: 'That image is larger than 12 MB' }, { status: 400 });
      const stored = await uploadAvatar(bytes, fetched.headers.get('content-type') || 'image/png');
      return Response.json({ ok: stored.ok, action, stored: stored.data, error: stored.error });
    }

    if (action === 'image.preview') {
      const health = await avatarJson('/health');
      if (!health.ok || !health.data?.avatar) return Response.json({ ok: false, action, error: 'No image is loaded on the host yet.' });
      return Response.json({ ok: true, action, url: await signedAvatarUrl('/avatar') });
    }

    if (action === 'render') {
      const text = String(payload.text || '').trim();
      if (!text) return Response.json({ ok: false, error: 'text is required' }, { status: 400 });
      const started = await avatarJson('/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      return Response.json({ ok: started.ok, action, job: started.data?.job || null, error: started.error });
    }

    if (action === 'renders') {
      const list = await avatarJson('/renders');
      return Response.json({ ok: list.ok, action, data: list.data, error: list.error });
    }

    if (action === 'render.get') {
      const jobId = String(payload.job_id || '').trim();
      if (!jobId) return Response.json({ ok: false, error: 'job_id is required' }, { status: 400 });
      const job = await avatarJson(`/renders/${encodeURIComponent(jobId)}`);
      const record = job.data?.job || null;
      // A finished render is copied into the app's own storage: the host forgets its jobs on
      // restart, and her video must outlive the container.
      const known = RENDER_FILES.get(jobId);
      let videoUrl = known && Date.now() - known.at < 45 * 60 * 1000 ? known.url : null;
      let fileUri = known?.uri || null;
      let persistError = null;
      if (record && record.status === 'done' && !videoUrl && fileUri) {
        // still in app storage, only the link aged out
        const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 3600 });
        videoUrl = signed.signed_url;
        RENDER_FILES.set(jobId, { url: videoUrl, uri: fileUri, at: Date.now() });
      }
      if (record && record.status === 'done' && !videoUrl) {
        // The host is the authority on where it keeps a finished render, so its own path is tried
        // first, then the shapes this app has used.
        const paths = [
          record.video_url,
          `/renders/${encodeURIComponent(jobId)}.mp4`,
          `/renders/${encodeURIComponent(jobId)}/file`,
          `/renders/${encodeURIComponent(jobId)}/video`,
          `/video/${encodeURIComponent(jobId)}.mp4`,
          `/renders/${encodeURIComponent(jobId)}/download`,
          `/download/${encodeURIComponent(jobId)}.mp4`,
        ].filter(Boolean);
        const probe = [];
        let file = { ok: false, error: 'no path' };
        for (const path of paths) {
          const attempt = await avatarBytes(path);
          const head = attempt.ok ? String.fromCharCode(...attempt.bytes.slice(4, 8)) : null;
          probe.push({ path, status: attempt.status || 200, type: attempt.type, bytes: attempt.bytes?.byteLength || 0, mp4: head === 'ftyp' });
          // Only real MP4 bytes count — the host answers a job lookup with JSON, and that must
          // never be stored as if it were her video.
          if (attempt.ok && head === 'ftyp') {
            file = attempt;
            break;
          }
        }
        if (!file.ok) {
          persistError = `The host did not return the video. ${JSON.stringify(probe).slice(0, 700)}`;
        } else {
          const uploaded = await base44.asServiceRole.integrations.Core.UploadPrivateFile({
            file: new File([file.bytes], `eden-${jobId}.mp4`, { type: 'video/mp4' }),
          });
          fileUri = uploaded.file_uri;
          const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 3600 });
          videoUrl = signed.signed_url;
          RENDER_FILES.set(jobId, { url: videoUrl, uri: fileUri, at: Date.now() });
        }
      }
      return Response.json({ ok: job.ok, action, job: record, video_url: videoUrl, file_uri: fileUri, error: job.error || persistError });
    }

    if (action === 'script') {
      const intent = String(payload.intent || '').trim();
      if (!intent) return Response.json({ ok: false, error: 'intent is required' }, { status: 400 });
      const seconds = Math.min(Math.max(Number(payload.seconds) || 12, 4), 120);
      const words = Math.max(12, Math.round(seconds * 2.3));
      const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are Eden Skye, the voice of X1 Apex Factory. Write exactly what she says out loud, first person, as one short spoken passage of no more than ${words} words. Plain speakable sentences only: no stage directions, no quotation marks, no headings, no emoji, no markdown. Intent: ${intent}`,
      });
      const text = String(answer || '')
        .trim()
        .replace(/^["'“”]+|["'“”]+$/g, '')
        .slice(0, 20000);
      return Response.json({ ok: Boolean(text), action, text, words: text.split(/\s+/).filter(Boolean).length });
    }

    return Response.json({ ok: false, error: 'Unknown action', service: AVATAR_RAILWAY.serviceName }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}