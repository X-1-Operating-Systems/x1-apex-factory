/**
 * The register of what HeyGen and LiveAvatar expose, and what this app serves instead.
 *
 * One row per capability. `verdict` is the only allowed vocabulary:
 *   cloned       - this app serves it from a container it owns, and it was exercised
 *   wired        - this app has the route built, but no live proof yet
 *   vendor       - only the vendor can serve it; the app calls their API with a key
 *   not_cloneable- it cannot be reproduced without vendor weights, data or GPU economics
 *
 * Nothing here is a percentage. Read a row, then check its proof or its note.
 */

export type Verdict = 'cloned' | 'wired' | 'vendor' | 'not_cloneable';

export interface RegisterRow {
  id: string;
  vendor: 'heygen' | 'liveavatar' | 'both';
  surface: string;
  vendorEndpoint: string;
  verdict: Verdict;
  served_by: string;
  note: string;
  proof_action?: { provider: 'heygen' | 'liveavatar'; action: string };
}

export const MEDIA_REGISTER: RegisterRow[] = [
  // ---- HeyGen: avatars -----------------------------------------------------
  {
    id: 'hg.avatar.list',
    vendor: 'heygen',
    surface: 'Avatar groups and looks',
    vendorEndpoint: 'GET /v3/avatars',
    verdict: 'vendor',
    served_by: 'video function (heygen)',
    note: 'Vendor catalogue of their own rendered people. This app reads it; it cannot reproduce their looks.',
    proof_action: { provider: 'heygen', action: 'avatars.list' },
  },
  {
    id: 'hg.avatar.photo',
    vendor: 'heygen',
    surface: 'Photo avatar from one still',
    vendorEndpoint: 'POST /v3/avatars (photo)',
    verdict: 'cloned',
    served_by: 'avatar-host /avatar + /render (Wav2Lip)',
    note: 'Her still is stored and animated on our own container. Byte-for-byte her image, no vendor.',
  },
  {
    id: 'hg.avatar.footage',
    vendor: 'heygen',
    surface: 'Digital twin trained from footage',
    vendorEndpoint: 'POST /v3/avatars (footage)',
    verdict: 'not_cloneable',
    served_by: '-',
    note: 'Needs a trained per-person model and GPU training time. Our container animates a still; it does not train a twin.',
  },
  {
    id: 'hg.avatar.video',
    vendor: 'heygen',
    surface: 'Avatar video from a script',
    vendorEndpoint: 'POST /v3/videos (type: avatar)',
    verdict: 'cloned',
    served_by: 'avatar-host /render (Piper + Wav2Lip)',
    note: 'Script in, MP4 out, produced on the owned container and copied into app storage.',
  },
  {
    id: 'hg.avatar.cinematic',
    vendor: 'heygen',
    surface: 'Cinematic avatar / multi-shot direction',
    vendorEndpoint: 'POST /v3/videos (type: cinematic_avatar)',
    verdict: 'not_cloneable',
    served_by: '-',
    note: 'Camera direction is a proprietary renderer. No open equivalent at that quality.',
  },

  // ---- HeyGen: voice -------------------------------------------------------
  {
    id: 'hg.voice.list',
    vendor: 'heygen',
    surface: 'Voice catalogue and languages',
    vendorEndpoint: 'GET /v3/voices',
    verdict: 'vendor',
    served_by: 'video function (heygen)',
    note: 'Vendor voice bank. Our substitute is a preset registry on the owned voice host.',
    proof_action: { provider: 'heygen', action: 'voices.list' },
  },
  {
    id: 'hg.voice.clone',
    vendor: 'heygen',
    surface: 'Instant voice clone',
    vendorEndpoint: 'POST /v3/voices (clone)',
    verdict: 'wired',
    served_by: 'voice-host /clone + /speak (XTTS-v2)',
    note: 'Reference audio is stored privately on the owned container; synthesis needs the clone weights on its volume. Deploy is the only step left.',
  },
  {
    id: 'hg.voice.design',
    vendor: 'heygen',
    surface: 'Voice design from a text prompt',
    vendorEndpoint: 'POST /v3/voices',
    verdict: 'not_cloneable',
    served_by: '-',
    note: 'A prompt-to-voice generative model. Approximated by mapping a prompt to the nearest preset, which is not the same thing and is not claimed as such.',
  },
  {
    id: 'hg.tts',
    vendor: 'heygen',
    surface: 'Text to speech',
    vendorEndpoint: 'POST /v3/audio',
    verdict: 'wired',
    served_by: 'voice-host /speak (Piper presets)',
    note: 'Route built and reachable once the container is deployed; WAV is written to its own volume.',
  },

  // ---- HeyGen: generation --------------------------------------------------
  {
    id: 'hg.video.agent',
    vendor: 'heygen',
    surface: 'Video Agent (prompt to edited video)',
    vendorEndpoint: 'POST /v3/video-agents',
    verdict: 'not_cloneable',
    served_by: '-',
    note: 'A hosted agent wrapping their models and stock asset library. Nothing open reproduces it end to end.',
  },
  {
    id: 'hg.video.model',
    vendor: 'heygen',
    surface: 'HeyGen Video / HeyGen Image models',
    vendorEndpoint: 'POST /v3/models/videos, /v3/models/images',
    verdict: 'not_cloneable',
    served_by: '-',
    note: 'Vendor model weights and inference. Not reproducible on our hardware at any quality that would be honest to ship.',
  },
  {
    id: 'hg.templates',
    vendor: 'heygen',
    surface: 'Templates and brand kit',
    vendorEndpoint: 'vendor dashboard only',
    verdict: 'vendor',
    served_by: 'app Template entity (223 records)',
    note: 'The app carries its own template library for site work; their video templates are their assets.',
  },
  {
    id: 'hg.translate',
    vendor: 'heygen',
    surface: 'Translation and dubbing',
    vendorEndpoint: 'POST /v3/videos/translate',
    verdict: 'not_cloneable',
    served_by: '-',
    note: 'Needs ASR, voice clone, alignment and re-render at vendor quality. A partial open pipeline is possible; it is not built and not claimed.',
  },
  {
    id: 'hg.lipsync',
    vendor: 'heygen',
    surface: 'Lipsync an existing video',
    vendorEndpoint: 'POST /v3/lipsync',
    verdict: 'wired',
    served_by: 'avatar-host /render (Wav2Lip, image input)',
    note: 'Wav2Lip is the same family of method, but our route takes a still, not an uploaded video. Video-in lipsync is not exposed yet.',
  },
  {
    id: 'hg.usage',
    vendor: 'heygen',
    surface: 'Credits and account',
    vendorEndpoint: 'GET /v3/users/me',
    verdict: 'vendor',
    served_by: 'video function (heygen)',
    note: 'Read live and shown on the video studio. Wallet reads $0.00, which is why no render can be produced right now.',
    proof_action: { provider: 'heygen', action: 'account.me' },
  },
  {
    id: 'hg.videos.list',
    vendor: 'heygen',
    surface: 'Render history',
    vendorEndpoint: 'GET /v3/videos',
    verdict: 'vendor',
    served_by: 'video function (heygen) + VideoJob records',
    note: 'Listed live; every render this app starts is also stored as a VideoJob.',
    proof_action: { provider: 'heygen', action: 'videos.list' },
  },

  // ---- LiveAvatar: streaming ----------------------------------------------
  {
    id: 'la.session.token',
    vendor: 'liveavatar',
    surface: 'Session token (short-lived Bearer)',
    vendorEndpoint: 'POST /v1/sessions/token',
    verdict: 'vendor',
    served_by: 'video function (liveavatar)',
    note: 'Start and stop take a session token, not the account key. The token is never stored in the page.',
  },
  {
    id: 'la.session.start',
    vendor: 'liveavatar',
    surface: 'Start / stop a live room',
    vendorEndpoint: 'POST /v1/sessions/start',
    verdict: 'vendor',
    served_by: 'edenLive function + LiveSession records',
    note: 'Proven live in the free sandbox: room, LiveKit URL and client token returned, then stopped cleanly.',
  },
  {
    id: 'la.full',
    vendor: 'liveavatar',
    surface: 'FULL mode (their ASR + LLM + TTS + WebRTC)',
    vendorEndpoint: 'docs: full-mode',
    verdict: 'vendor',
    served_by: 'edenMind (mind) + LiveAvatar (transport)',
    note: 'Her mind, memory and delivery are ours; the real-time transport is theirs. A clone needs a self-hosted SFU plus streaming inference.',
  },
  {
    id: 'la.lite',
    vendor: 'liveavatar',
    surface: 'LITE mode (avatar only, bring your own stack)',
    vendorEndpoint: 'docs: lite-mode',
    verdict: 'not_cloneable',
    served_by: '-',
    note: 'Streaming video inference per frame. Our avatar-host renders files, not frames, and has no WebRTC path.',
  },
  {
    id: 'la.contexts',
    vendor: 'liveavatar',
    surface: 'Persistent context (persona + voice + settings)',
    vendorEndpoint: '/v1/contexts',
    verdict: 'vendor',
    served_by: 'video function (liveavatar) + EmotionProfile (app)',
    note: 'Her persona, boundaries and emotional state live in this app; their context record carries the vendor-side binding.',
    proof_action: { provider: 'liveavatar', action: 'contexts.list' },
  },
  {
    id: 'la.avatars',
    vendor: 'liveavatar',
    surface: 'Owned avatars inside LiveAvatar',
    vendorEndpoint: 'GET /v1/avatars',
    verdict: 'vendor',
    served_by: 'video function (liveavatar)',
    note: 'Reads 0 owned avatars on this account, so a room can only run their sandbox preview face. Their console is the only place her identity can be installed.',
    proof_action: { provider: 'liveavatar', action: 'avatars.list' },
  },
  {
    id: 'la.transcript',
    vendor: 'liveavatar',
    surface: 'Session transcript',
    vendorEndpoint: 'GET /v1/sessions/{id}/transcript',
    verdict: 'vendor',
    served_by: 'video function (liveavatar) + SessionTranscript',
    note: 'Read per session and rendered under the room.',
  },
  {
    id: 'la.credits',
    vendor: 'liveavatar',
    surface: 'Credits and spend',
    vendorEndpoint: 'GET /v1/credits',
    verdict: 'vendor',
    served_by: 'video function (liveavatar)',
    note: 'Read live on the live avatar studio and on the reality check page.',
    proof_action: { provider: 'liveavatar', action: 'credits.get' },
  },
  {
    id: 'la.embed',
    vendor: 'liveavatar',
    surface: 'Hosted embed iframe',
    vendorEndpoint: 'POST /v2/embeddings',
    verdict: 'vendor',
    served_by: 'AvatarStage (LiveKit client, our own room UI)',
    note: 'Their iframe is their surface. This app joins the room itself so the UI stays ours.',
  },
];

export const CLONE_MAP = [
  {
    capability: 'Voice clone',
    vendor: 'HeyGen POST /v3/voices',
    substitute: 'XTTS-v2 on voice-host, reference audio kept on its own volume',
    ceiling: 'Similarity is close, not identical; per-language quality varies.',
  },
  {
    capability: 'Text to speech',
    vendor: 'HeyGen POST /v3/audio',
    substitute: 'Piper voices on voice-host (the same engine avatar-host already renders with)',
    ceiling: 'Fewer voices, no emotion tags.',
  },
  {
    capability: 'Avatar video',
    vendor: 'HeyGen POST /v3/videos',
    substitute: 'avatar-host: Piper speech + Wav2Lip against her own still',
    ceiling: 'Head-and-shoulders from a still. No body motion, no camera moves.',
  },
  {
    capability: 'Live room transport',
    vendor: 'LiveAvatar session + LiveKit',
    substitute: 'LiveAvatar stays the transport; the mind and memory are already ours (edenMind)',
    ceiling: 'Self-hosting the transport needs an SFU container plus frame-level streaming inference; not built.',
  },
  {
    capability: 'Ledger and assets',
    vendor: 'Vendor dashboards',
    substitute: 'Supabase tables + private buckets, and app entities with owner-or-admin RLS',
    ceiling: 'None; this half is fully owned.',
  },
];

export const NOT_CLONEABLE = [
  'HeyGen Avatar III / IV / V renderer weights, and Cinematic Avatar direction.',
  'HeyGen Video Agent and the HeyGen Video / Image models behind it.',
  'HeyGen prompt-to-voice (voice design) model.',
  'HeyGen translation/dubbing quality, which depends on their ASR, alignment and clone stack together.',
  'LiveAvatar frame-level streaming inference (LITE), which needs per-frame GPU inference and a WebRTC path.',
  'Vendor GPU economics: unlimited concurrency at pennies a minute is a datacentre, not a container.',
];