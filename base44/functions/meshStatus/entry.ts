// Mesh status: probes every wired system in both directions and records each heartbeat so the
// connection has a history instead of an opinion.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { probeAll } from '../../shared/mesh.ts';

const secret = (name: string) => Deno.env.get(name) || '';

export default async function(req: Request) {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ ok: false, error: 'Sign in first.' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ ok: false, error: 'Admins only.' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || 'state');

  if (action === 'latest') {
    const page = await base44.asServiceRole.entities.MeshRun.list('-at', 8);
    return Response.json({ ok: true, runs: page });
  }

  const snapshot = await probeAll(secret);

  if (action === 'beat') {
    const record = await base44.asServiceRole.entities.MeshRun.create({
      at: snapshot.checked_at,
      ok: snapshot.ok,
      total: snapshot.total,
      score: snapshot.score,
      nodes: snapshot.nodes.map((n) => ({ id: n.id, label: n.label, ok: n.ok, detail: n.detail })),
      note: `${snapshot.ok} of ${snapshot.total} nodes answered`,
    });
    return Response.json({ ok: true, action, run: record, ...snapshot });
  }

  const page = await base44.asServiceRole.entities.MeshRun.list('-at', 8);
  return Response.json({ ok: true, action: 'state', runs: page, ...snapshot });
}