import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { manusCall, digestTask, normalizeEvents, buildContent, summarizeRun } from '../../shared/manus.ts';

const TASK_ID = /^[A-Za-z0-9_-]{4,80}$/;

// Private app uploads become short-lived signed URLs Manus can fetch on the spot.
async function signFiles(base44: any, list: any[]) {
  const files: any[] = [];
  for (const item of Array.isArray(list) ? list.slice(0, 5) : []) {
    const fileUri = String(item?.file_uri || '');
    if (!fileUri.startsWith('private/')) continue;
    const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
      file_uri: fileUri,
      expires_in: 1800,
    });
    files.push({
      name: String(item?.name || 'file').slice(0, 120),
      url: signed_url,
      type: String(item?.mime_type || ''),
    });
  }
  return files;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || '');

    if (action === 'create') {
      const instruction = String(body?.instruction || '').trim();
      if (!instruction) return Response.json({ error: 'An instruction is required.' }, { status: 400 });
      if (instruction.length > 6000) return Response.json({ error: 'That brief is too long for Manus.' }, { status: 400 });

      const title = String(body?.title || '').trim().slice(0, 120);
      const files = await signFiles(base44, body?.attachments);
      const created = await manusCall('/v2/task.create', {
        method: 'POST',
        body: {
          message: { content: buildContent(instruction, files) },
          title: title || undefined,
          interactive_mode: true,
          hide_in_task_list: false,
        },
      });

      return Response.json({
        task_id: created.task_id,
        task_url: created.task_url,
        task_title: created.task_title || title,
      });
    }

    if (action === 'status') {
      const taskId = String(body?.task_id || '');
      if (!TASK_ID.test(taskId)) return Response.json({ error: 'A valid task_id is required.' }, { status: 400 });

      const listed = await manusCall('/v2/task.listMessages', {
        query: { task_id: taskId, order: 'desc', limit: 30, verbose: true },
      });
      return Response.json(digestTask(listed.messages || []));
    }

    if (action === 'earlier') {
      const taskId = String(body?.task_id || '');
      if (!TASK_ID.test(taskId)) return Response.json({ error: 'A valid task_id is required.' }, { status: 400 });

      const listed = await manusCall('/v2/task.listMessages', {
        query: { task_id: taskId, order: 'desc', limit: 40, verbose: true, cursor: body?.cursor || undefined },
      });
      return Response.json({
        events: normalizeEvents(listed.messages || []),
        next_cursor: listed.next_cursor || null,
        has_more: Boolean(listed.has_more),
      });
    }

    if (action === 'detail') {
      const taskId = String(body?.task_id || '');
      if (!TASK_ID.test(taskId)) return Response.json({ error: 'A valid task_id is required.' }, { status: 400 });

      const [detail, listed] = await Promise.all([
        manusCall('/v2/task.detail', { query: { task_id: taskId } }),
        manusCall('/v2/task.listMessages', {
          query: { task_id: taskId, order: 'desc', limit: 60, verbose: true },
        }),
      ]);

      const task = detail.task || {};
      return Response.json({
        task: {
          id: task.id || taskId,
          title: task.title || '',
          status: task.status || 'running',
          type: task.task_type || 'standard',
          created_at: task.created_at || 0,
          updated_at: task.updated_at || 0,
          task_url: task.task_url || '',
          credit_usage: task.credit_usage || 0,
          visibility: task.share_visibility || 'private',
        },
        events: normalizeEvents(listed.messages || []),
        digest: digestTask(listed.messages || []),
        run: summarizeRun(listed.messages || []),
        next_cursor: listed.next_cursor || null,
        has_more: Boolean(listed.has_more),
      });
    }

    if (action === 'send') {
      const taskId = String(body?.task_id || '');
      const message = String(body?.message || '').trim();
      if (!TASK_ID.test(taskId)) return Response.json({ error: 'A valid task_id is required.' }, { status: 400 });
      if (message.length > 4000) return Response.json({ error: 'That message is too long.' }, { status: 400 });

      const files = await signFiles(base44, body?.attachments);
      if (!message && !files.length) return Response.json({ error: 'A message is required.' }, { status: 400 });

      await manusCall('/v2/task.sendMessage', {
        method: 'POST',
        body: { task_id: taskId, message: { content: buildContent(message, files) } },
      });
      return Response.json({ ok: true });
    }

    if (action === 'tasks') {
      const limit = Math.min(100, Math.max(1, Number(body?.limit) || 40));
      const listed = await manusCall('/v2/task.list', {
        query: { limit, cursor: body?.cursor || undefined, order: 'desc' },
      });
      return Response.json({
        tasks: (listed.data || []).map((task: any) => ({
          id: task.id,
          title: task.title || '',
          status: task.status || 'stopped',
          type: task.task_type || 'standard',
          created_at: task.created_at || 0,
          task_url: task.task_url || '',
        })),
        next_cursor: listed.next_cursor || null,
        has_more: Boolean(listed.has_more),
      });
    }

    if (action === 'browsers') {
      const listed = await manusCall('/v2/browser.onlineList');
      return Response.json({
        browsers: (listed.data || []).map((client: any) => ({
          id: client.client_id,
          name: client.client_name || 'Browser',
          ua: client.ua || '',
        })),
      });
    }

    if (action === 'agents') {
      const listed = await manusCall('/v2/agent.list');
      return Response.json({
        agents: (listed.data || []).map((agent: any) => ({
          id: agent.id,
          task_id: agent.task_id || '',
          nickname: agent.nickname || 'Agent',
          about: agent.about || '',
        })),
      });
    }

    if (action === 'stop') {
      const taskId = String(body?.task_id || '');
      if (!TASK_ID.test(taskId)) return Response.json({ error: 'A valid task_id is required.' }, { status: 400 });
      await manusCall('/v2/task.stop', { method: 'POST', body: { task_id: taskId } });
      return Response.json({ ok: true });
    }

    if (action === 'artifacts') {
      const type = String(body?.type || 'all');
      const allowed = ['all', 'website', 'mobile_app', 'game', 'documents', 'slides', 'spreadsheets', 'images', 'videos', 'audio', 'others'];
      if (!allowed.includes(type)) return Response.json({ error: 'Unknown artifact type.' }, { status: 400 });

      const listed = await manusCall('/v2/artifact.list', {
        query: { type, limit: Math.min(60, Math.max(1, Number(body?.limit) || 24)), cursor: body?.cursor || undefined },
      });
      return Response.json({
        artifacts: (listed.data || []).map((item: any) => ({
          id: item.id,
          task_id: item.task_id || '',
          task_title: item.task_title || '',
          name: item.display_name || item.filename || 'Artifact',
          type: item.type || 'others',
          url: item.url || '',
          cover_image: item.cover_image || '',
          favorite: Boolean(item.favorite),
          updated_at: item.updated_at || 0,
        })),
        next_cursor: listed.next_cursor || null,
        has_more: Boolean(listed.has_more),
      });
    }

    if (action === 'connectors') {
      const listed = await manusCall('/v2/connector.list');
      return Response.json({
        connectors: (listed.data || []).map((connector: any) => ({
          id: connector.id,
          name: connector.name || 'Connector',
          type: connector.type || 'builtin',
          description: connector.description || '',
          category: connector.category || 'other',
        })),
      });
    }

    if (action === 'website') {
      const taskId = String(body?.task_id || '');
      const websiteId = String(body?.website_id || '');
      if (!TASK_ID.test(taskId) && !TASK_ID.test(websiteId)) {
        return Response.json({ error: 'A task_id or website_id is required.' }, { status: 400 });
      }
      const site = await manusCall('/v2/website.status', {
        query: { task_id: taskId || undefined, website_id: websiteId || undefined },
      });
      return Response.json({
        website_id: site.website_id || websiteId,
        title: site.title || '',
        publish_status: site.publish_status || 'unpublished',
        visibility: site.visibility || 'public',
        site_url: (site.site_urls || [])[0] || '',
        published_version_id: site.published_version_id || '',
      });
    }

    if (action === 'publish') {
      const taskId = String(body?.task_id || '');
      const websiteId = String(body?.website_id || '');
      if (!TASK_ID.test(taskId) && !TASK_ID.test(websiteId)) {
        return Response.json({ error: 'A task_id or website_id is required.' }, { status: 400 });
      }
      const published = await manusCall('/v2/website.publish', {
        method: 'POST',
        body: {
          task_id: taskId || undefined,
          website_id: websiteId || undefined,
          visibility: String(body?.visibility || 'public'),
        },
      });
      return Response.json({ website_id: published.website_id || websiteId, version_id: published.version_id || '' });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Manus request failed.' }, { status: error?.status || 500 });
  }
}