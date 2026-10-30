import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { advanceJob, MODEL } from '../../shared/autopilot.ts';

const ACTIVE = ['queued', 'running'];
const TICK_BUDGET_MS = 200000;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admins only.' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = typeof body?.action === 'string' ? body.action : 'list';
    const store = base44.asServiceRole.entities.AutopilotJob;

    if (action === 'start') {
      const command = typeof body?.command === 'string' ? body.command.trim() : '';
      if (command.length < 8) return Response.json({ error: 'Write the command you want the system to carry out.' }, { status: 400 });

      const record = await store.create({
        created_by_id: user.id,
        command: command.slice(0, 4000),
        status: 'queued',
        stage: 'brief',
        model: MODEL,
        revision: 0,
        build_index: 0,
        pages: [],
        steps: [],
      });
      const advanced = await advanceJob(base44, record);
      return Response.json({ job: advanced });
    }

    if (action === 'tick') {
      const deadline = Date.now() + TICK_BUDGET_MS;
      const advanced: any[] = [];

      const targets = body?.job_id
        ? [await store.get(String(body.job_id)).catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)))].filter(Boolean)
        : (
            await store.filter({ status: { $in: ACTIVE } }, { sort: 'updated_date', limit: 5 })
          ).items || [];

      for (const job of targets as any[]) {
        if (Date.now() > deadline) break;
        if (!ACTIVE.includes(String(job.status))) continue;
        if (job.next_at && new Date(job.next_at).getTime() > Date.now()) continue;

        // Claim the turn first so a second tick cannot work the same job.
        await store.update(job.id, { next_at: new Date(Date.now() + 60000).toISOString() });
        let current = await store.get(job.id);
        if (!ACTIVE.includes(String(current.status))) continue;

        // A single job polled from the page moves one stage; the clock works a job to the end.
        const oneStage = Boolean(body?.job_id);
        do {
          current = await advanceJob(base44, current);
          if (oneStage) break;
        } while (Date.now() < deadline && ACTIVE.includes(String(current.status)) && current.stage !== 'done');

        advanced.push(current);
      }

      return Response.json({ ok: true, advanced });
    }

    if (action === 'get') {
      if (!body?.job_id) return Response.json({ error: 'job_id is required.' }, { status: 400 });
      const job = await store.get(String(body.job_id)).catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!job) return Response.json({ error: 'Not found' }, { status: 404 });
      return Response.json({ job });
    }

    if (action === 'stop') {
      if (!body?.job_id) return Response.json({ error: 'job_id is required.' }, { status: 400 });
      const job = await store.update(String(body.job_id), { status: 'stopped', stage: 'done' });
      return Response.json({ job });
    }

    const list = await store.list({ sort: '-created_date', limit: 20 });
    return Response.json({ jobs: list.items || [], model: MODEL });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Autopilot failed.' }, { status: 500 });
  }
}