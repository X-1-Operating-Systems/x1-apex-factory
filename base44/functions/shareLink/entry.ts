import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { renderPageHtml } from '../../shared/bundle.ts';

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
        deployment_id: link.deployment_id || '',
        pages: Array.isArray(link.pages) ? link.pages : [],
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

    // Client handoff: renders the released pages to public files and hands the
    // client one read-only link, so reviewing a build needs no app account.
    if (action === 'handoff') {
      const deploymentId = String(body?.deployment_id || '');
      if (!deploymentId) return Response.json({ error: 'A release is required.' }, { status: 400 });

      const deployment = await base44.entities.Deployment.get(deploymentId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e)
      );
      if (!deployment) return Response.json({ error: 'That release no longer exists.' }, { status: 404 });
      if (deployment.status === 'blocked' || deployment.status === 'superseded') {
        return Response.json({ error: 'Only a live release can be handed to a client.' }, { status: 400 });
      }

      const password = String(body?.password || '');
      if (password && password.length < 4) {
        return Response.json({ error: 'Use at least 4 characters for the password.' }, { status: 400 });
      }

      const [project, pageRows] = await Promise.all([
        base44.entities.Project.get(deployment.project_id),
        base44.entities.StudioPage.filter({ project_id: deployment.project_id }, { sort: 'created_date', limit: 50 }),
      ]);
      const pages = (pageRows.items || []).filter((row: any) => (row.blocks || []).length);
      if (!pages.length) {
        return Response.json({ error: 'Compose at least one section before handing this release off.' }, { status: 400 });
      }

      const files: { name: string; path: string; url: string }[] = [];
      for (const row of pages) {
        const html = renderPageHtml({ project, page: row });
        const slug = String(row.path || '/').replace(/^\/+|\/+$/g, '') || 'index';
        const { file_url } = await base44.asServiceRole.integrations.Core.UploadPublicFile({
          file: new File([html], `${slug.replace(/\//g, '-')}.html`, { type: 'text/html' }),
        });
        files.push({ name: row.name, path: row.path || '/', url: file_url });
      }

      const token = crypto.randomUUID().replace(/-/g, '');
      const created = await base44.entities.ShareLink.create({
        token,
        project_id: deployment.project_id,
        deployment_id: deploymentId,
        site_title: deployment.project_name,
        site_url: deployment.url || '',
        label: `Release v${deployment.page_version || 1}`,
        pages: files,
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
          pages: created.pages || [],
          expires_at: created.expires_at || '',
          revoked: false,
          has_password: Boolean(created.password_hash),
          view_count: 0,
        },
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