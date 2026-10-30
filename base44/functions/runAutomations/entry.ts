import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { launchAutomation, triggerMode } from '../../shared/automations.ts';

const DEFAULT_TZ = 'America/New_York';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function localNow(timeZone = DEFAULT_TZ) {
  let zone = timeZone;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(new Date());
  } catch (error) {
    zone = DEFAULT_TZ;
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const map: any = {};
  for (const part of parts) map[part.type] = part.value;
  return { hour: Number(map.hour) % 24, minute: Number(map.minute), day: DAYS.indexOf(map.weekday) };
}

function isDue(automation: any, now: { hour: number; minute: number; day: number }) {
  const cadence = automation.cadence || 'daily';
  if (cadence === 'hourly') return true;
  if (cadence === 'daily') return now.hour === Number(automation.run_hour ?? 9);
  return now.day === Number(automation.run_day ?? 1) && now.hour === Number(automation.run_hour ?? 9);
}

function ranTooRecently(automation: any) {
  if (!automation.last_run_at) return false;
  const minutes = (Date.now() - new Date(automation.last_run_at).getTime()) / 60000;
  const window = automation.cadence === 'hourly' ? 55 : automation.cadence === 'weekly' ? 60 * 24 * 6 : 60 * 20;
  return minutes < window;
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const isAdmin = user.role === 'admin';

    if (String(body?.mode || '') === 'due') {
      if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const list = await base44.asServiceRole.entities.Automation.filter({ enabled: true });
      const launched = [];
      for (const automation of list) {
        if (triggerMode(automation) !== 'schedule') continue;
        const now = localNow(automation.timezone);
        if (!isDue(automation, now) || ranTooRecently(automation)) continue;
        const result = await launchAutomation(base44, automation);
        if (result) launched.push(result);
      }
      return Response.json({ ran: launched.length, launched });
    }

    const automationId = String(body?.automation_id || '');
    if (!automationId) return Response.json({ error: 'automation_id is required.' }, { status: 400 });

    const automation = await base44.asServiceRole.entities.Automation.get(automationId);
    if (!automation) return Response.json({ error: 'Automation not found.' }, { status: 404 });
    if (!isAdmin && automation.created_by_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await launchAutomation(base44, automation);
    if (!result) return Response.json({ error: 'This automation has no instruction.' }, { status: 400 });
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Could not run the automation.' }, { status: error?.status || 500 });
  }
}