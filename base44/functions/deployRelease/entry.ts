import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { auditPage } from '../../shared/qa.ts';
import { manifestHash, renderPageHtml, targetFiles } from '../../shared/bundle.ts';

const TARGETS = ['vercel', 'railway', 'docker', 'github_pages'];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || '');

    if (action === 'run') {
      const projectId = String(body?.project_id || '');
      if (!projectId) return Response.json({ error: 'A project is required.' }, { status: 400 });

      const project = await base44.entities.Project.get(projectId);
      const target = TARGETS.includes(String(body?.target)) ? String(body.target) : project.deploy_target || 'vercel';

      const pageResult = await base44.entities.StudioPage.filter({ project_id: projectId }, { sort: 'created_date', limit: 50 });
      const pages = (pageResult.items || []).filter((row: any) => (row.blocks || []).length);
      if (!pages.length) {
        return Response.json({ error: 'Compose at least one section before preparing a release.' }, { status: 400 });
      }

      const rank: any = { pass: 0, review: 1, block: 2 };
      const audits = pages.map((row: any) => ({ page: row, audit: auditPage(row) }));
      const worst = audits.reduce(
        (acc: any, row: any) => (rank[row.audit.verdict] > rank[acc.audit.verdict] ? row : acc),
        audits[0]
      );
      const verdict = worst.audit.verdict;
      const score = Math.round(audits.reduce((sum: number, row: any) => sum + row.audit.score, 0) / audits.length);
      const findings = audits.flatMap((row: any) => row.audit.findings).slice(0, 12);
      const version = Math.max(...pages.map((row: any) => row.version || 1));

      const hash = await manifestHash(
        pages.map((row: any) => ({ path: row.path, version: row.version, blocks: row.blocks }))
      );
      const rendered = pages.map((row: any) => ({
        name: row.name,
        path: row.path || '/',
        html: renderPageHtml({ project, page: row }),
      }));
      const manifest = {
        project: project.name,
        target,
        manifest_hash: hash,
        pages: pages.map((row: any) => ({
          name: row.name,
          path: row.path || '/',
          version: row.version || 1,
          sections: (row.blocks || []).map((block: any) => ({ id: block.id, type: block.type })),
        })),
        qa: { verdict, score },
        generated_at: new Date().toISOString(),
      };

      const files = targetFiles(target, rendered, manifest);
      const artifacts: { name: string; file_uri: string; bytes: number }[] = [];
      for (const file of files) {
        const { file_uri } = await base44.asServiceRole.integrations.Core.UploadPrivateFile({
          file: new File([file.content], file.name.replace(/\//g, '-'), { type: file.type }),
        });
        artifacts.push({ name: file.name, file_uri, bytes: file.content.length });
      }

      const blocked = verdict === 'block';
      const stages = [
        {
          key: 'freeze',
          label: 'Freeze pages',
          status: 'pass',
          detail: `${pages.length} page${pages.length === 1 ? '' : 's'} · v${version} · ${hash}`,
        },
        {
          key: 'review',
          label: 'Release review',
          status: blocked ? 'fail' : verdict === 'review' ? 'warn' : 'pass',
          detail: `${score}/100 · ${verdict}${worst.audit.verdict !== 'pass' ? ` · ${worst.page.name}` : ''}`,
        },
        { key: 'bundle', label: `Bundle · ${target}`, status: 'pass', detail: `${files.length} files packaged` },
        {
          key: 'handoff',
          label: 'Handoff',
          status: blocked ? 'skipped' : 'queued',
          detail: blocked ? 'Fix the blocking findings, then prepare again' : 'Approve to accept this build',
        },
      ];

      const deployment = await base44.entities.Deployment.create({
        project_id: projectId,
        project_name: project.name,
        target,
        status: blocked ? 'blocked' : 'ready_for_approval',
        manifest_hash: hash,
        page_version: version,
        qa_score: score,
        qa_verdict: verdict,
        stages,
        artifacts,
        notes: blocked
          ? `Blocked by release review: ${findings[0] || 'see findings'}`
          : `Build ${hash} packaged for ${target} across ${pages.length} page${pages.length === 1 ? '' : 's'}. ${findings[0] || 'No outstanding findings.'}`,
      });

      const pending = await base44.entities.Deployment.filter(
        { project_id: projectId, status: 'ready_for_approval' },
        { limit: 50 }
      );
      const stale = pending.items.filter((row: any) => row.id !== deployment.id);
      if (stale.length) {
        await base44.entities.Deployment.bulkUpdate(stale.map((row: any) => ({ id: row.id, status: 'superseded' })));
      }

      await base44.entities.QaRun.create({
        project_id: projectId,
        project_name: project.name,
        verdict,
        score,
        page_version: version,
        checks: worst.audit.checks,
        findings,
      });

      const updatedProject = await base44.entities.Project.update(projectId, {
        status: blocked ? 'review' : 'ready',
        deploy_target: target,
      });

      return Response.json({
        deployment,
        audit: { verdict, score, findings, checks: worst.audit.checks, pages: pages.length },
        project: updatedProject,
      });
    }

    if (action === 'approve') {
      const deploymentId = String(body?.deployment_id || '');
      if (!deploymentId) return Response.json({ error: 'A release is required.' }, { status: 400 });

      const record = await base44.entities.Deployment.get(deploymentId);
      if (record.status !== 'ready_for_approval') {
        return Response.json({ error: 'Only a release waiting for approval can be approved.' }, { status: 400 });
      }

      const approvedAt = new Date().toISOString();
      const updated = await base44.entities.Deployment.update(deploymentId, {
        status: 'approved',
        approved_at: approvedAt,
        approved_by: user.email,
        stages: (record.stages || []).map((stage: any) =>
          stage.key === 'handoff' ? { ...stage, status: 'pass', detail: `Approved by ${user.email}` } : stage
        ),
      });

      const approved = await base44.entities.Deployment.filter(
        { project_id: record.project_id, status: 'approved' },
        { limit: 50 }
      );
      const stale = approved.items.filter((row: any) => row.id !== deploymentId);
      if (stale.length) {
        await base44.entities.Deployment.bulkUpdate(stale.map((row: any) => ({ id: row.id, status: 'superseded' })));
      }

      return Response.json({ deployment: updated });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Release pipeline failed.' }, { status: error?.status || 500 });
  }
}