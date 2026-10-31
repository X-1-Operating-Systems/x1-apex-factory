import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { callHeyGen } from '../../shared/heygen.ts';
import { callLiveAvatar } from '../../shared/liveavatar.ts';
import { ensureAvatarHost, avatarJson, NOT_CONNECTED } from '../../shared/avatarHost.ts';
import { MEDIA_REGISTER, CLONE_MAP, NOT_CLONEABLE } from '../../shared/mediaRegister.ts';

/**
 * The parity register, plus a live reading for every row that can be read without spending.
 * Read-only by construction: the probe actions below are list/get/me/credits only.
 */
const PROBES: Record<string, () => Promise<unknown>> = {
  'heygen:account.me': async () => callHeyGen('account.me', {}, secrets.get('HEYGEN_API_KEY')),
  'heygen:avatars.list': async () => callHeyGen('avatars.list', { limit: 20 }, secrets.get('HEYGEN_API_KEY')),
  'heygen:voices.list': async () => callHeyGen('voices.list', { limit: 20 }, secrets.get('HEYGEN_API_KEY')),
  'heygen:videos.list': async () => callHeyGen('videos.list', { limit: 10 }, secrets.get('HEYGEN_API_KEY')),
  'liveavatar:credits.get': async () => callLiveAvatar('credits.get', {}, secrets.get('LIVEAVATAR_API_KEY')),
  'liveavatar:contexts.list': async () => callLiveAvatar('contexts.list', {}, secrets.get('LIVEAVATAR_API_KEY')),
  'liveavatar:avatars.list': async () => callLiveAvatar('avatars.list', {}, secrets.get('LIVEAVATAR_API_KEY')),
};

/** Pull one number out of the shapes these APIs actually return. */
function summarise(payload: any): string {
  const data = payload?.data?.data ?? payload?.data ?? payload;
  if (data == null) return 'no payload';
  if (data.wallet) return `wallet ${data.wallet.currency} ${data.wallet.remaining_balance}`;
  if (data.credits_left != null) return `${data.credits_left} credits left`;
  if (Array.isArray(data)) return `${data.length} items`;
  if (typeof data.count === 'number') return `${data.count} items`;
  if (Array.isArray(data.data)) return `${data.data.length} items`;
  const keys = Object.keys(data);
  return keys.length ? `${keys.length} fields` : 'empty';
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ ok: false, error: 'The parity register is admin-only.' }, { status: 403 });
    }

    const results: Record<string, { ok: boolean; detail: string }> = {};
    await Promise.all(
      Object.entries(PROBES).map(async ([key, run]) => {
        try {
          const payload = await run();
          const failed = payload?.ok === false;
          results[key] = { ok: !failed, detail: failed ? String(payload?.error || 'refused') : summarise(payload) };
        } catch (err: any) {
          results[key] = { ok: false, detail: String(err?.message || err).slice(0, 160) };
        }
      })
    );

    // The owned container is a probe of its own: resolve it first (the client caches the address it
    // finds), then read its health. Gating on avatarConfigured() before resolution reads false always.
    let ownedHost = { ok: false, detail: 'not resolved' };
    try {
      const host = await ensureAvatarHost();
      if (!host?.url) {
        ownedHost = { ok: false, detail: NOT_CONNECTED };
      } else {
        const health = await avatarJson('/health');
        ownedHost = {
          ok: Boolean(health.ok && health.data?.ok),
          detail: health.ok ? `owned container healthy (${host.source})` : String(health.error || 'refused'),
        };
      }
    } catch (err: any) {
      ownedHost = { ok: false, detail: String(err?.message || err).slice(0, 160) };
    }

    return Response.json({
      ok: true,
      observed_at: new Date().toISOString(),
      register: MEDIA_REGISTER,
      clone_map: CLONE_MAP,
      not_cloneable: NOT_CLONEABLE,
      owned_host: ownedHost,
      probes: results,
    });
  } catch (error: any) {
    return Response.json({ ok: false, error: String(error?.message || error) }, { status: 500 });
  }
}