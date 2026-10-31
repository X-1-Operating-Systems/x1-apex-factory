import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

// Presence only, never values. Every surface reads this before it calls a provider, so removing a
// key turns one card into a plain "not connected" note instead of a failure that looks like a bug.
const SECRETS = [
  'HEYGEN_API_KEY',
  'HEYGEN_AVATAR_ID',
  'LIVEAVATAR_API_KEY',
  'RAILWAY_API_KEY',
  'BROWSER_HOST_URL',
  'BROWSER_HOST_TOKEN',
  'VOICE_HOST_URL',
  'VOICE_HOST_TOKEN',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'SUPABASE_ACCESS_TOKEN',
  'VERCEL_API_KEY',
  'MANUS_API_KEY',
  'X1_BRIDGE_KEY',
];

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const secrets_state = {};
    for (const name of SECRETS) secrets_state[name] = Boolean(secrets.get(name));

    const ready = {
      heygen: secrets_state.HEYGEN_API_KEY,
      liveavatar: secrets_state.LIVEAVATAR_API_KEY,
      host:
        (secrets_state.BROWSER_HOST_URL && secrets_state.BROWSER_HOST_TOKEN) || secrets_state.RAILWAY_API_KEY,
      voice: secrets_state.VOICE_HOST_URL && secrets_state.VOICE_HOST_TOKEN,
      ledger: secrets_state.SUPABASE_URL && secrets_state.SUPABASE_SERVICE_KEY,
      vercel: secrets_state.VERCEL_API_KEY,
      manus: secrets_state.MANUS_API_KEY,
      bridge: secrets_state.X1_BRIDGE_KEY,
    };

    return Response.json({
      ok: true,
      admin: user.role === 'admin',
      secrets: secrets_state,
      ready,
      // What each one powers, and what keeps working without it. The screens quote this, so the
      // wording lives in one place instead of drifting per page.
      surfaces: [
        {
          key: 'HEYGEN_API_KEY',
          surface: 'Video studio',
          stops: 'Avatar and voice lists, and every new render.',
          keeps: 'Stored renders and the capability list stay readable.',
          ready: ready.heygen,
        },
        {
          key: 'LIVEAVATAR_API_KEY',
          surface: 'Live avatar',
          stops: 'New sessions, credits and context lookups.',
          keeps: 'Past sessions and their transcripts stay readable.',
          ready: ready.liveavatar,
        },
        {
          key: 'RAILWAY_API_KEY',
          surface: 'Browser host',
          stops: 'Resolving the owned container if BROWSER_HOST_URL and BROWSER_HOST_TOKEN are not set.',
          keeps: 'Tasks, projects, releases and the media surfaces are unaffected.',
          ready: ready.host,
        },
        {
          key: 'VOICE_HOST_URL',
          surface: 'Voice host (clone)',
          stops: 'Our own speech container is not addressed, so voice cloning and our own TTS stop.',
          keeps: 'Every screen works; voice falls back to the vendor while its key is present.',
          ready: ready.voice,
        },
        {
          key: 'VERCEL_API_KEY',
          surface: 'Release deploy',
          stops: 'Pushing an approved release to a live URL.',
          keeps: 'Packaging, the QA gate, bundle downloads and client handoff links all still work.',
          ready: ready.vercel,
        },
        {
          key: 'MANUS_API_KEY',
          surface: 'Manus engine',
          stops: 'Manus tasks, devices and artifacts.',
          keeps: 'The native engine runs every task; the app already falls back to it.',
          ready: ready.manus,
        },
        {
          key: 'X1_BRIDGE_KEY',
          surface: 'X1 bridge',
          stops: 'Every call the X1 Operating System makes into this factory is refused.',
          keeps: 'Every screen in the app works; the console says the bridge is not armed.',
          ready: ready.bridge,
        },
        {
          key: 'SUPABASE_ACCESS_TOKEN',
          surface: 'Host provisioning',
          stops: 'Provisioning and migrating the host ledger from this app.',
          keeps: 'Every app screen — the ledger is external bookkeeping.',
          ready: secrets_state.SUPABASE_ACCESS_TOKEN,
        },
      ],
    });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || 'The request failed.' }, { status: 500 });
  }
}