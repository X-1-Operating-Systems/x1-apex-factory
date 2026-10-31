import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  HEAL_ACTIONS,
  PROBE_CATALOG,
  applyHeal,
  compareRuns,
  nonce,
  runAudit,
  runProbes,
  scoreOf,
  signRun,
  verdictFor,
} from '../../shared/guardian.ts';

const OPEN_JOB_STATUSES = ['brief_ready', 'planning', 'plan_ready', 'plan_failed'];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admins only.' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = typeof body?.action === 'string' ? body.action : 'state';
    const store = base44.asServiceRole.entities;

    if (action === 'state') {
      const [runs, checkpoints, findings, resolved, jobs] = await Promise.all([
        store.BenchmarkRun.filter({}, { sort: '-created_date', limit: 6 }).then((page: any) => page.items || []),
        store.BenchmarkCheckpoint.filter({}, { sort: '-created_date', limit: 4 }).then((page: any) => page.items || []),
        store.GuardianFinding.filter({ status: 'open' }, { sort: '-created_date', limit: 40 }).then((page: any) => page.items || []),
        store.GuardianFinding.filter({ status: { $in: ['resolved', 'acknowledged'] } }, { sort: '-updated_date', limit: 12 }).then((page: any) => page.items || []),
        store.EnhancementJob.filter({}, { sort: '-created_date', limit: 25 }).then((page: any) => page.items || []),
      ]);

      const latest = runs[0] || null;
      return Response.json({
        ok: true,
        catalog: PROBE_CATALOG,
        healActions: HEAL_ACTIONS,
        runs,
        checkpoints,
        findings,
        resolved,
        jobs,
        score: latest ? scoreOf(latest.observations) : null,
        verdict: latest ? verdictFor(scoreOf(latest.observations)) : 'unverified',
        latest,
        previous: runs[1] || null,
      });
    }

    if (action === 'verify') {
      const url = new URL(req.url);
      const observations = await runProbes(base44, {
        origin: url.origin,
        auth: req.headers.get('authorization') || '',
      });

      const previousPage = await store.BenchmarkRun.filter({}, { sort: '-created_date', limit: 1 });
      const previous = (previousPage.items || [])[0] || null;

      const stamp = new Date().toISOString();
      const runNonce = nonce();
      const signature = await signRun(observations, runNonce);
      const revision = `r-${stamp.slice(0, 19)}`;

      const run = await store.BenchmarkRun.create({
        created_by_id: user.id,
        owner_id: user.id,
        revision,
        run_nonce: runNonce,
        observed_at: stamp,
        observations,
        signature,
      });

      // The findings ledger follows the evidence: a probe that fails opens one, a probe that passes closes it.
      const openFindings = await store.GuardianFinding.filter({ kind: 'probe', status: 'open' }, { limit: 200 }).then(
        (page: any) => page.items || [],
      );
      for (const observation of observations) {
        const ref = `probe:${observation.probe_id}`;
        const existing = openFindings.find((finding: any) => finding.ref === ref);
        if (!observation.passed && !existing) {
          await store.GuardianFinding.create({
            created_by_id: user.id,
            kind: 'probe',
            severity: 'high',
            area: PROBE_CATALOG.find((probe) => probe.id === observation.probe_id)?.area || 'platform',
            title: PROBE_CATALOG.find((probe) => probe.id === observation.probe_id)?.label || observation.probe_id,
            detail: observation.detail,
            evidence: observation.detail,
            ref,
            status: 'open',
            auto: true,
            detected_at: stamp,
          });
        }
        if (observation.passed && existing) {
          await store.GuardianFinding.update(existing.id, {
            status: 'resolved',
            resolved_at: stamp,
            evidence: observation.detail,
          });
        }
      }

      const comparison = compareRuns(previous, run);
      const score = scoreOf(observations);
      const passed = observations.filter((item) => item.passed).length;
      const failed = observations.length - passed;

      const checkpoint = await store.BenchmarkCheckpoint.create({
        created_by_id: user.id,
        owner_id: user.id,
        request_id: String(body?.request_id || `verify-${runNonce.slice(0, 8)}`),
        revision,
        summary: `${passed}/${observations.length} probes passed (${score}%). ${verdictFor(score)}.`,
        implemented: observations.filter((item) => item.passed).slice(0, 20).map((item) => `${item.probe_id}: ${item.detail}`),
        verification: comparison.regressions.length
          ? comparison.regressions.map((item) => `REGRESSED ${item.probe_id}: ${item.detail}`)
          : ['No regression against the previous run'],
        blockers: observations.filter((item) => !item.passed).map((item) => `${item.probe_id}: ${item.detail}`),
        next_batch: failed
          ? `Repair ${failed} failing probe${failed === 1 ? '' : 's'}, then re-run verification.`
          : comparison.recovered.length
            ? `${comparison.recovered.length} capability recovered; widen the catalog.`
            : 'Hold the line: every installed capability answers.',
        work_items: observations.map((item) => ({
          criterion_id: item.probe_id,
          state: item.passed ? 'implementation_ready' : 'blocked',
          note: String(item.detail).slice(0, 500),
        })),
        score_snapshot: {
          run_id: run.id,
          feature_parity: score,
          check_coverage: Math.round((observations.length / Math.max(PROBE_CATALOG.length, 1)) * 100),
          passed,
          failed,
          not_tested: Math.max(PROBE_CATALOG.length - observations.length, 0),
          evidence_fresh: true,
          release_approved: verdictFor(score) === 'verified',
        },
      });

      return Response.json({
        ok: true,
        run,
        previous,
        score,
        verdict: verdictFor(score),
        regressions: comparison.regressions,
        recovered: comparison.recovered,
        firstRun: comparison.firstRun,
        checkpoint,
      });
    }

    if (action === 'audit') {
      const findings = await runAudit(base44);
      const stamp = new Date().toISOString();
      const open = await store.GuardianFinding.filter({ kind: 'audit', status: 'open' }, { limit: 200 }).then(
        (page: any) => page.items || [],
      );

      const live = new Set(findings.map((finding: any) => finding.ref));
      const created: any[] = [];
      for (const finding of findings) {
        if (open.some((entry: any) => entry.ref === finding.ref)) continue;
        created.push(
          await store.GuardianFinding.create({
            created_by_id: user.id,
            kind: 'audit',
            severity: finding.severity,
            area: finding.area,
            title: finding.title,
            detail: finding.detail,
            evidence: finding.evidence,
            ref: finding.ref,
            status: 'open',
            auto: true,
            detected_at: stamp,
          }),
        );
      }

      // A finding whose evidence is gone is closed, not left open as history.
      const cleared = open.filter((entry: any) => !live.has(entry.ref));
      for (const entry of cleared) {
        await store.GuardianFinding.update(entry.id, { status: 'resolved', resolved_at: stamp, evidence: 'No longer detected by the audit' });
      }

      return Response.json({ ok: true, findings, opened: created.length, closed: cleared.length });
    }

    if (action === 'heal') {
      const key = typeof body?.repair === 'string' ? body.repair : '';
      if (!HEAL_ACTIONS.some((entry) => entry.key === key)) {
        return Response.json({ error: 'That repair is not installed.' }, { status: 400 });
      }
      const result = await applyHeal(base44, key);
      const stamp = new Date().toISOString();
      await store.GuardianFinding.create({
        created_by_id: user.id,
        kind: 'heal',
        severity: 'low',
        area: key.split('.')[0],
        title: `${key} — ${result.note}`,
        detail: `Repair ${key} ran and reported: ${result.note}`,
        evidence: result.note,
        ref: `heal:${key}:${stamp}`,
        status: 'resolved',
        auto: true,
        detected_at: stamp,
        resolved_at: stamp,
      });
      return Response.json({ ok: true, ...result });
    }

    if (action === 'evolve') {
      const [findings, jobs] = await Promise.all([
        store.GuardianFinding.filter({ status: 'open' }, { sort: '-created_date', limit: 100 }).then((page: any) => page.items || []),
        store.EnhancementJob.filter({ status: { $in: OPEN_JOB_STATUSES } }, { limit: 200 }).then((page: any) => page.items || []),
      ]);
      const lastRun = await store.BenchmarkRun.filter({}, { sort: '-created_date', limit: 1 }).then(
        (page: any) => (page.items || [])[0] || null,
      );
      const queued = new Set(jobs.map((job: any) => job.criterion_id));
      const created: any[] = [];

      for (const finding of findings) {
        const criterion = finding.ref || `finding:${finding.id}`;
        if (queued.has(criterion)) continue;
        created.push(
          await store.EnhancementJob.create({
            created_by_id: user.id,
            owner_id: user.id,
            criterion_id: criterion,
            route: 'builder',
            request_id: finding.id,
            revision: lastRun?.revision || 'unverified',
            status: 'brief_ready',
            plan: `[${finding.severity}] ${finding.title}\n\n${finding.detail}\n\nEvidence: ${finding.evidence || 'none recorded'}`,
          }),
        );
        queued.add(criterion);
      }

      return Response.json({ ok: true, created, skipped: findings.length - created.length });
    }

    if (action === 'resolve') {
      const id = String(body?.finding_id || '');
      if (!id) return Response.json({ error: 'Which finding?' }, { status: 400 });
      const status = ['open', 'resolved', 'acknowledged'].includes(body?.status) ? body.status : 'resolved';
      const finding = await store.GuardianFinding.update(id, {
        status,
        resolved_at: status === 'open' ? null : new Date().toISOString(),
      });
      return Response.json({ ok: true, finding });
    }

    return Response.json({ error: `Unknown action "${action}".` }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'The guardian failed.' }, { status: 500 });
  }
}