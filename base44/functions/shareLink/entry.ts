import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function expiryFor(hours: number) {
  if (!hours || hours <= 0) return '';
  return new Date(Date.now() + hours * 3600 * 1000).toISOString();
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || 'create');

    if (action === 'resolve') {
      const token = String(body?.token || '').trim();
      if (!token || token.length < 8) {
        return Response.json({ error: 'This share link is not valid.' }, { status: 400 });
      }

      const found = await base44.asServiceRole.entities.ShareLink.filter({ token }, { limit: 1 });
      const link = found.items[0];
      if (!link) return Response.json({ error: 'This share link is not valid.' }, { status: 404 });
      if (link.revoked) return Response.json({ error: 'This link was turned off by its owner.' }, { status: 410 });
      if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
        return Response.json({ error: 'This link has expired.' }, { status: 410 });
      }

      if (link.password_hash) {
        const password = String(body?.password || '');
        if (!password) return Response.json({ requires_password: true }, { status: 401 });
        const attempt = await digest(`${password}:${link.token}`);
        if (attempt !== link.password_hash) {
          return Response.json({ requires_password: true, error: 'That password is not right.' }, { status: 401 });
        }
      }

      await base44.asServiceRole.entities.ShareLink.update(link.id, {
        view_count: (link.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      });

      return Response.json({
        title: link.site_title || 'Shared site',
        label: link.label || '',
        site_url: link.site_url || '',
        access: link.access || 'view',
      });
    }

    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (action === 'list') {
      const taskId = String(body?.task_id || '');
      if (!taskId) return Response.json({ error: 'A task_id is required.' }, { status: 400 });
      const page = await base44.entities.ShareLink.filter({ task_id: taskId }, { sort: '-created_date', limit: 50 });
      return Response.json({
        links: page.items.map((item: any) => ({
          id: item.id,
          token: item.token,
          label: item.label || '',
          site_title: item.site_title || '',
          expires_at: item.expires_at || '',
          revoked: Boolean(item.revoked),
          has_password: Boolean(item.password_hash),
          view_count: item.view_count || 0,
          last_viewed_at: item.last_viewed_at || '',
          created_date: item.created_date,
        })),
      });
    }

    if (action === 'revoke') {
      const id = String(body?.id || '');
      if (!id) return Response.json({ error: 'A link id is required.' }, { status: 400 });
      const link = await base44.entities.ShareLink.get(id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!link) return Response.json({ error: 'That link no longer exists.' }, { status: 404 });
      if (link.created_by_id !== user.id && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      const updated = await base44.entities.ShareLink.update(id, { revoked: true });
      return Response.json({ id: updated.id, revoked: true });
    }

    const taskId = String(body?.task_id || '');
    if (!taskId) return Response.json({ error: 'A task_id is required.' }, { status: 400 });

    const password = String(body?.password || '');
    if (password && password.length < 4) {
      return Response.json({ error: 'Use at least 4 characters for the password.' }, { status: 400 });
    }

    const token = crypto.randomUUID().replace(/-/g, '');
    const created = await base44.entities.ShareLink.create({
      token,
      task_id: taskId,
      website_id: String(body?.website_id || ''),
      site_title: String(body?.site_title || ''),
      site_url: String(body?.site_url || ''),
      label: String(body?.label || '').slice(0, 120),
      access: 'view',
      password_hash: password ? await digest(`${password}:${token}`) : '',
      expires_at: expiryFor(Number(body?.expires_in_hours) || 0),
      revoked: false,
      view_count: 0,
    });

    return Response.json({
      link: {
        id: created.id,
        token: created.token,
        label: created.label || '',
        site_title: created.site_title || '',
        expires_at: created.expires_at || '',
        revoked: false,
        has_password: Boolean(created.password_hash),
        view_count: 0,
        last_viewed_at: '',
        created_date: created.created_date,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}