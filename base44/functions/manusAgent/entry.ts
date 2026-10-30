import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { manusCall, digestTask } from '../../shared/manus.ts';

const TASK_ID = /^[A-Za-z0-9_-]{4,80}$/;

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
      const created = await manusCall('/v2/task.create', {
        method: 'POST',
        body: {
          message: { content: instruction },
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

    if (action === 'send') {
      const taskId = String(body?.task_id || '');
      const message = String(body?.message || '').trim();
      if (!TASK_ID.test(taskId)) return Response.json({ error: 'A valid task_id is required.' }, { status: 400 });
      if (!message) return Response.json({ error: 'A message is required.' }, { status: 400 });
      if (message.length > 4000) return Response.json({ error: 'That message is too long.' }, { status: 400 });

      await manusCall('/v2/task.sendMessage', {
        method: 'POST',
        body: { task_id: taskId, message: { content: message } },
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

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Manus request failed.' }, { status: error?.status || 500 });
  }
}