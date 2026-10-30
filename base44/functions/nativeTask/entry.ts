import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { createNativeTask, followUpNativeTask, AI_MODEL } from '../../shared/native.ts';

const TASK_TYPES = ['website', 'documents', 'slides', 'spreadsheets', 'images', 'others'];

function shape(task: any, includeEvents = false) {
  const created = new Date(task.created_date || Date.now()).getTime() / 1000;
  return {
    id: task.id,
    title: task.title || 'Untitled task',
    status: task.status || 'stopped',
    type: 'native',
    engine: 'native',
    model: task.model || AI_MODEL,
    effort: task.effort || 'standard',
    project_id: task.project_id || '',
    created_at: created,
    updated_at: new Date(task.updated_date || task.created_date || Date.now()).getTime() / 1000,
    task_url: '',
    summary: task.summary || '',
    credit_usage: 0,
    ...(includeEvents
      ? {
          instruction: task.instruction || '',
          deliverable: task.deliverable || null,
          events: (task.events || []).map((event: any, index: number) => ({
            id: `${task.id}-${index}`,
            role: event.role,
            content: event.content,
            ts: event.ts,
            attachments: Array.isArray(event.attachments) ? event.attachments : [],
          })),
        }
      : {}),
  };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || '');

    if (action === 'create') {
      const instruction = String(body?.instruction || '').trim();
      if (!instruction) return Response.json({ error: 'An instruction is required.' }, { status: 400 });
      if (instruction.length > 6000) return Response.json({ error: 'That brief is too long.' }, { status: 400 });

      const task = await createNativeTask(base44, {
        userId: user.id,
        title: String(body?.title || '').slice(0, 120),
        instruction,
        agentId: String(body?.agent_id || ''),
        model: body?.model,
        effort: body?.effort,
        attachments: Array.isArray(body?.attachments) ? body.attachments : [],
        projectId: String(body?.project_id || ''),
      });

      if (task.status === 'error') {
        const failure = (task.events || []).slice(-1)[0]?.content || 'The studio run failed.';
        return Response.json({ error: failure, task_id: task.id }, { status: 502 });
      }

      return Response.json({ task_id: task.id, task_url: '', title: task.title, engine: 'native' });
    }

    if (action === 'list') {
      const limit = Math.min(60, Math.max(1, Number(body?.limit) || 40));
      const status = String(body?.status || 'all');
      const term = String(body?.query || '').trim().slice(0, 120);

      const where: any = {};
      if (status && status !== 'all') where.status = status;
      if (term) {
        where.$or = [
          { title: { $regex: term, $options: 'i' } },
          { instruction: { $regex: term, $options: 'i' } },
        ];
      }

      const page = await base44.entities.StudioTask.filter(where, {
        sort: '-created_date',
        limit,
        ...(body?.cursor ? { cursor: body.cursor } : {}),
      });

      return Response.json({
        tasks: page.items.map((task: any) => shape(task)),
        has_more: Boolean(page.has_more),
        next_cursor: page.next_cursor || null,
        total: await base44.entities.StudioTask.count(where),
      });
    }

    if (action === 'detail') {
      const taskId = String(body?.task_id || '');
      if (!taskId) return Response.json({ error: 'A task id is required.' }, { status: 400 });
      const task = await base44.entities.StudioTask.get(taskId).catch((e: any) => (e.status === 404 ? null : Promise.reject(e)));
      if (!task) return Response.json({ error: 'Not found' }, { status: 404 });

      return Response.json({
        task: shape(task, true),
        events: shape(task, true).events,
        digest: {},
        next_cursor: null,
        has_more: false,
      });
    }

    if (action === 'send') {
      const taskId = String(body?.task_id || '');
      const message = String(body?.message || '').trim();
      if (!taskId) return Response.json({ error: 'A task id is required.' }, { status: 400 });
      if (!message) return Response.json({ error: 'A message is required.' }, { status: 400 });
      if (message.length > 4000) return Response.json({ error: 'That message is too long.' }, { status: 400 });

      const task = await base44.entities.StudioTask.get(taskId).catch((e: any) => (e.status === 404 ? null : Promise.reject(e)));
      if (!task) return Response.json({ error: 'Not found' }, { status: 404 });

      await followUpNativeTask(base44, {
        task,
        message,
        model: body?.model,
        effort: body?.effort,
        attachments: Array.isArray(body?.attachments) ? body.attachments : [],
      });
      return Response.json({ ok: true });
    }

    if (action === 'stop') {
      const taskId = String(body?.task_id || '');
      if (!taskId) return Response.json({ error: 'A task id is required.' }, { status: 400 });
      await base44.entities.StudioTask.update(taskId, { status: 'stopped' });
      return Response.json({ ok: true });
    }

    if (action === 'artifacts') {
      const type = String(body?.type || 'all');
      if (type !== 'all' && !TASK_TYPES.includes(type)) return Response.json({ error: 'Unknown artifact type.' }, { status: 400 });
      const limit = Math.min(60, Math.max(1, Number(body?.limit) || 24));

      const { items } = await base44.entities.StudioTask.filter({}, { sort: '-created_date', limit: 100 });
      const artifacts = items
        .filter((task: any) => task.deliverable?.name)
        .filter((task: any) => type === 'all' || task.deliverable.type === type)
        .slice(0, limit)
        .map((task: any) => ({
          id: task.id,
          task_id: task.id,
          task_title: task.title || 'Task',
          name: task.deliverable.name,
          type: task.deliverable.type || 'others',
          detail: task.deliverable.detail || '',
          engine: 'native',
          updated_at: new Date(task.updated_date || task.created_date || Date.now()).getTime() / 1000,
        }));

      return Response.json({ artifacts, has_more: false, next_cursor: null });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'The studio run failed.' }, { status: 500 });
  }
}