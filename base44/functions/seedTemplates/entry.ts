import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildCatalog } from '../../shared/catalog/registry.js';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const catalog = buildCatalog();

    const existing = new Set<string>();
    let cursor: string | undefined;
    for (let guard = 0; guard < 40; guard += 1) {
      const page = await base44.asServiceRole.entities.Template.list({
        sort: 'created_date',
        limit: 100,
        ...(cursor ? { cursor } : {}),
      });
      page.items.forEach((t: any) => existing.add(t.name));
      if (!page.has_more || !page.next_cursor) break;
      cursor = page.next_cursor;
    }

    const missing = catalog.filter((t) => !existing.has(t.name));
    let created = 0;
    for (let i = 0; i < missing.length; i += 20) {
      const chunk = missing.slice(i, i + 20);
      await base44.asServiceRole.entities.Template.bulkCreate(chunk);
      created += chunk.length;
    }

    const total = await base44.asServiceRole.entities.Template.count({});
    return Response.json({ created, total, inCatalog: catalog.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}