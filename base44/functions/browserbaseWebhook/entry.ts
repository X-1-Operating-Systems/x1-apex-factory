import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

async function hmacHex(secret, body) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function bounded(payload) {
  let serialized = '{}';
  try {
    serialized = JSON.stringify(payload);
  } catch (error) {
    return { unreadable: true };
  }
  if (serialized.length <= 3000) return JSON.parse(serialized);
  return { truncated: true, preview: serialized.slice(0, 3000) };
}

export default async function (req) {
  try {
    if (req.method !== 'POST') return Response.json({ error: 'POST only' }, { status: 405 });

    const base44 = createClientFromRequest(req);
    const raw = await req.text();
    if (!raw) return Response.json({ error: 'Empty body' }, { status: 400 });

    let payload = {};
    try {
      payload = JSON.parse(raw);
    } catch (error) {
      payload = { unparsed: raw.slice(0, 1000) };
    }

    let secret = null;
    try {
      secret = secrets.get('BROWSERBASE_WEBHOOK_SECRET');
    } catch (error) {
      secret = null;
    }

    let verified = false;
    if (secret) {
      const messageId = req.headers.get('webhook-id') || '';
      const timestamp = req.headers.get('webhook-timestamp') || '';
      const header =
        req.headers.get('webhook-signature') || req.headers.get('x-browserbase-signature') || '';
      const signedPayload = `${messageId}.${timestamp}.${raw}`;
      const hmac = await hmacHex(secret, signedPayload);
      const flat = await hmacHex(secret, raw);
      verified =
        header
          .split(' ')
          .filter(Boolean)
          .some((part) => part.replace(/^v1,/, '').replace(/^sha256=/, '') === hmac) ||
        header.replace(/^sha256=/, '') === flat;
      if (!verified) return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const eventType = String(payload.type || payload.event || payload.eventType || 'unknown');
    const sessionId = payload.sessionId ? String(payload.sessionId) : undefined;
    const runId = payload.runId ? String(payload.runId) : undefined;

    const record = await base44.asServiceRole.entities.BrowserWebhookEvent.create({
      event_id: String(payload.id || payload.eventId || crypto.randomUUID()),
      event_type: eventType,
      verified,
      payload: bounded(payload),
      session_id: sessionId,
      run_id: runId,
      received_at: new Date().toISOString(),
    });

    if (runId) {
      const { items } = await base44.asServiceRole.entities.BrowserRun.filter(
        { run_id: runId },
        { sort: '-created_date', limit: 1 }
      );
      if (items.length) {
        await base44.asServiceRole.entities.BrowserRun.update(items[0].id, { webhook_state: eventType });
      }
    }

    return Response.json({ ok: true, id: record.id, verified, event_type: eventType });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}