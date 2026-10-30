import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { auditPage } from '../../shared/qa.ts';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { page } = body;
    if (!page || !Array.isArray(page.blocks)) {
      return Response.json({ error: 'A page with blocks is required.' }, { status: 400 });
    }

    return Response.json(auditPage(page));
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}