import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { launchAutomation, eventMatches } from '../../shared/automations.ts';

/**
 * Called by the "Task Finished Automations" workflow when a task reaches a terminal state.
 * Starts every enabled event automation of the task's owner that matches the outcome.
 */
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const taskId = String(body?.task_id || '');
    if (!taskId) return Response.json({ error: 'task_id is required.' }, { status: 400 });

    const task = await base44.asServiceRole.entities.StudioTask.get(taskId).catch((e: any) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!task) return Response.json({ error: 'Task not found.' }, { status: 404 });
    if (task.status !== 'stopped' && task.status !== 'error') {
      return Response.json({ ran: 0, launched: [], reason: 'Task is still running.' });
    }

    const automations = await base44.asServiceRole.entities.Automation.filter({ enabled: true });
    const matches = (automations || []).filter((automation: any) => eventMatches(automation, task));

    const launched: any[] = [];
    for (const automation of matches) {
      const result = await launchAutomation(base44, automation);
      if (result) launched.push(result);
    }

    return Response.json({ ran: launched.length, launched });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Could not run the event automations.' }, { status: 500 });
  }
}