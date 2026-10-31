import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import {
  BRIDGE_SECRET,
  BRIDGE_HEADER,
  KEYED_ACTIONS,
  OS_URL_SECRET,
  callOs,
  keyedAction,
  keyMatches,
  readKey,
} from '../../shared/bridge.ts';

// Two kinds of caller meet here. The app's own console asks for `state` and `verify` as a signed-in
// admin. Everything else is the X1 Operating System calling in from outside with the shared bridge
// key, so those calls carry no user session and are authorised by the key alone.
const ADMIN_ACTIONS = ['state', 'verify', 'os.status', 'os.call'];
// The Operating System answers its own contract (heartbeat / claim / complete); this app's keyed
// actions stay allowed so either side can be asked the same question.
const OUTBOUND_ACTIONS = ['ping', 'heartbeat', 'claim', 'complete', ...Object.keys(KEYED_ACTIONS)];
const PUBLIC_HOST = 'https://x1-apex-factory.base44.app';

async function record(base44: any, event: any) {
  // Bookkeeping must never break a bridge call.
  await base44.asServiceRole.entities.BridgeEvent.create(event).catch(() => null);
}

export default async function (req: Request): Promise<Response> {
  const started = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = typeof body?.action === 'string' && body.action.trim() ? body.action.trim() : 'ping';
    const configured = secrets.get(BRIDGE_SECRET) || '';
    const origin = (req.headers.get('X-Base44-App-Url') || PUBLIC_HOST).replace(/\/$/, '');
    const endpoint = `${origin}/functions/x1Bridge`;

    if (ADMIN_ACTIONS.includes(action)) {
      const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
      if (!user) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      if (user.role !== 'admin') {
        return Response.json({ ok: false, error: 'The bridge console is admin-only.' }, { status: 403 });
      }

      if (action === 'state') {
        return Response.json({
          ok: true,
          key_set: Boolean(configured),
          os_url_set: Boolean(secrets.get(OS_URL_SECRET)),
          os_url: secrets.get(OS_URL_SECRET) || '',
          secret: BRIDGE_SECRET,
          header: BRIDGE_HEADER,
          endpoint,
          actions: Object.entries(KEYED_ACTIONS).map(([name, description]) => ({ name, description })),
        });
      }

      // The other direction: this factory calling the X1 Operating System's own bridge.
      if (action === 'os.status' || action === 'os.call') {
        const osUrl = (secrets.get(OS_URL_SECRET) || '').trim();
        if (!osUrl) {
          return Response.json({
            ok: false,
            armed: false,
            error: `${OS_URL_SECRET} is not set, so the outbound direction has nowhere to go.`,
          });
        }
        const target = action === 'os.call' ? String(body?.os_action || 'heartbeat').trim() : 'heartbeat';
        if (!OUTBOUND_ACTIONS.includes(target)) {
          return Response.json({ ok: false, error: `"${target}" is not an outbound bridge action.` }, { status: 400 });
        }
        if (!configured) {
          return Response.json({ ok: false, armed: true, error: `${BRIDGE_SECRET} is not set, so the call cannot be signed.` });
        }
        // The OS asks every caller to identify itself, and it reads the name from a worker object.
        const given = body?.payload && typeof body.payload === 'object' ? body.payload : {};
        const payload = {
          ...given,
          worker: {
            name: 'x1-apex-factory',
            kind: 'factory',
            ...(given.worker && typeof given.worker === 'object' ? given.worker : {}),
          },
        };
        const answer = await callOs(osUrl, configured, target, payload);
        await record(base44, {
          action: `os.${target}`,
          direction: 'out',
          ok: answer.ok,
          status: answer.status,
          ms: 0,
          detail: answer.url,
          at: new Date().toISOString(),
        });
        return Response.json(
          { ok: answer.ok, armed: true, url: answer.url, status: answer.status, action: target, answer: answer.body },
          { status: answer.ok ? 200 : 502 },
        );
      }

      if (!configured) {
        return Response.json({
          ok: false,
          status: 0,
          ms: 0,
          error: `${BRIDGE_SECRET} is not set, so there is nothing to test.`,
        });
      }

      // Real round trips: the exact requests the OS sends, sent from outside this function, so the
      // console proves the key rather than describing it.
      const callKeyed = async (name: string) => {
        const at = Date.now();
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', [BRIDGE_HEADER]: configured },
          body: JSON.stringify({ action: name }),
          signal: AbortSignal.timeout(15000),
        });
        const payload = await res.json().catch(() => null);
        return { action: name, ok: res.ok, status: res.status, ms: Date.now() - at, payload };
      };

      const steps = [await callKeyed('ping'), await callKeyed('status')];
      const first = steps[0];
      return Response.json({
        ok: steps.every((step) => step.ok),
        status: first.status,
        ms: steps.reduce((total, step) => total + step.ms, 0),
        steps,
        endpoint,
      });
    }

    if (!KEYED_ACTIONS[action]) {
      return Response.json({ ok: false, error: `Unknown bridge action "${action}".` }, { status: 400 });
    }

    // An admin signed in through the app is as trusted as the key — that is how an MCP client reaches
    // this function. The key exists for machine callers that carry no user session at all.
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    const adminCaller = user?.role === 'admin';

    if (!configured && !adminCaller) {
      return Response.json(
        { ok: false, error: `The bridge is not armed: ${BRIDGE_SECRET} is not set in this app's Secrets.` },
        { status: 503 },
      );
    }

    const supplied = adminCaller ? '' : readKey(req, body);
    if (!adminCaller && !supplied) {
      return Response.json({ ok: false, error: 'Missing the bridge key.' }, { status: 401 });
    }

    if (!adminCaller && !(await keyMatches(configured, supplied))) {
      await record(base44, {
        action,
        direction: 'in',
        ok: false,
        status: 401,
        ms: Date.now() - started,
        detail: 'The supplied key was refused.',
        at: new Date().toISOString(),
      });
      return Response.json({ ok: false, error: 'The bridge key was refused.' }, { status: 401 });
    }

    const result = await keyedAction(base44, action, body);
    const ms = Date.now() - started;
    await record(base44, {
      action,
      direction: 'in',
      ok: true,
      status: 200,
      ms,
      detail: String(body?.id || body?.title || '').slice(0, 200),
      at: new Date().toISOString(),
    });
    return Response.json({ ok: true, action, ms, ...result });
  } catch (error: any) {
    const status = Number(error?.status);
    const safe = status >= 400 && status < 500 ? status : 500;
    return Response.json({ ok: false, error: error?.message || 'The bridge call failed.' }, { status: safe });
  }
}