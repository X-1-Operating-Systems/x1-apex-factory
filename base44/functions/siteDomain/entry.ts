import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const HOST = /^(?!-)[a-z0-9-]{1,63}(\.[a-z0-9-]{1,63})+$/i;

function clean(value: any) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((error: any) => (error?.status === 401 ? null : Promise.reject(error)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const hostname = clean(body?.hostname);
    if (!HOST.test(hostname)) {
      return Response.json(
        { error: 'Enter a domain without a path, for example www.acme.com.' },
        { status: 400 }
      );
    }

    const read = async (type: string) => {
      try {
        const records = await (Deno as any).resolveDns(hostname, type);
        return Array.isArray(records) ? records.map((entry: any) => String(entry).replace(/\.$/, '')) : [];
      } catch {
        return [];
      }
    };

    const [cname, a, aaaa] = await Promise.all([read('CNAME'), read('A'), read('AAAA')]);
    const target = clean(body?.target);
    const points = cname[0] || a[0] || aaaa[0] || '';
    const matches = target ? points === target || points.endsWith(`.${target}`) : Boolean(points);

    return Response.json({
      hostname,
      cname,
      a,
      aaaa,
      points,
      target,
      resolved: Boolean(points),
      matches,
      detail: points
        ? target
          ? `${hostname} points to ${points}${matches ? '' : ` — expected ${target}`}.`
          : `${hostname} resolves to ${points}.`
        : `${hostname} has no DNS records yet. Add the CNAME record, then try again.`,
    });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Domain lookup failed.' }, { status: 500 });
  }
}