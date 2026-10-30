import { createNativeTask } from './native.ts';

const RUN_HISTORY = 12;

export function triggerMode(automation: any) {
  return automation?.trigger_mode === 'event' ? 'event' : 'schedule';
}

/** Does a finished task satisfy this event automation's condition? */
export function eventMatches(automation: any, task: any) {
  if (triggerMode(automation) !== 'event') return false;
  if (automation?.enabled === false) return false;
  if (!task?.id) return false;
  if (!automation.created_by_id || automation.created_by_id !== task.created_by_id) return false;
  if (task.automation_id && task.automation_id === automation.id) return false;

  if (task.status !== 'stopped' && task.status !== 'error') return false;
  const when = automation.event_when || 'any';
  if (when === 'done') return task.status === 'stopped';
  if (when === 'failed') return task.status === 'error';
  return true;
}

/** Starts one run of an automation and records it in the automation's history. */
export async function launchAutomation(base44: any, automation: any) {
  const instruction = String(automation?.instruction || '').trim();
  if (!instruction) return null;

  const task = await createNativeTask(base44, {
    userId: automation.created_by_id,
    title: String(automation.title || '').slice(0, 120),
    instruction,
    automationId: automation.id,
  });

  const ranAt = new Date().toISOString();
  const history = Array.isArray(automation.runs) ? automation.runs : [];
  const runs = [{ task_id: task.id || '', at: ranAt, status: task.status || 'running' }, ...history].slice(
    0,
    RUN_HISTORY
  );

  await base44.asServiceRole.entities.Automation.update(automation.id, {
    last_run_at: ranAt,
    last_task_id: task.id || '',
    last_task_url: task.id ? `/task/${task.id}` : '',
    run_count: (automation.run_count || 0) + 1,
    runs,
  });

  return { automation_id: automation.id, task_id: task.id, task_url: task.id ? `/task/${task.id}` : '' };
}