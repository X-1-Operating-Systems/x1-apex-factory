// Eden's emotional simulation. The settings surface, the state vector, the appraisal dynamics and
// the prompt assembled from them all live here as pure functions, so the function that calls the
// model stays thin and the arithmetic can be read on its own.

export const EMOTION_KEYS = [
  'valence', 'arousal', 'dominance', 'trust', 'warmth', 'curiosity',
  'tension', 'energy', 'focus', 'intimacy', 'playfulness', 'patience',
];

export const BOUNDS = {
  temperature: [0, 2],
  reply_tokens: [64, 4096],
  variety: [0, 1],
  verbosity: [0, 1],
  formality: [0, 1],
  warmth: [0, 1],
  humor: [0, 1],
  flirtation: [0, 1],
  assertiveness: [0, 1],
  curiosity: [0, 1],
  playfulness: [0, 1],
  sarcasm: [0, 1],
  profanity: [0, 1],
  empathy: [0, 1],
  self_disclosure: [0, 1],
  teasing: [0, 1],
  initiative: [0, 1],
  poetic: [0, 1],
  baseline_valence: [-1, 1],
  baseline_arousal: [0, 1],
  baseline_dominance: [0, 1],
  expressiveness: [0, 2],
  sensitivity: [0, 1],
  volatility: [0, 1],
  inertia: [0, 1],
  decay: [0, 1],
  recovery: [0, 1],
  mirroring: [0, 1],
  rumination: [0, 1],
  contagion: [0, 1],
  memory_turns: [0, 40],
  turn_limit: [0, 500],
  speed: [0.5, 2],
  pitch: [-12, 12],
  delivery_energy: [0, 1],
};

export const CHOICES = {
  model: [
    'automatic', 'gemini_3_8_flash', 'gpt_6_luna', 'gpt_6_sol',
    'gpt_6_astra', 'claude-sonnet-5', 'claude_opus_5_5', 'claude_fable_5_1', 'glm_5_2',
  ],
  language: ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'sv', 'pl', 'tr', 'ru', 'ar', 'hi', 'ja', 'ko', 'zh', 'id', 'vi', 'th', 'he'],
  structure: ['prose', 'short paragraphs', 'bullets'],
  mood_vocabulary: ['minimal', 'expressive', 'poetic'],
  delivery_style: ['natural', 'soft', 'breathy', 'confident', 'playful', 'whisper'],
};

const TEXT_KEYS = [
  'display_name', 'model_note', 'system_prompt', 'backstory', 'boundaries',
  'greeting', 'idle_prompt', 'voice_id',
];

const BOOL_KEYS = ['web_context', 'show_reasoning', 'persist_state', 'log_turns', 'speech_enabled'];

export const DEFAULT_SETTINGS = {
  // generation
  model: 'automatic',
  reply_tokens: 600,
  temperature: 0.85,
  variety: 0.55,
  structure: 'prose',
  web_context: false,
  // identity
  display_name: 'Eden Skye',
  model_note: '',
  system_prompt: '',
  backstory:
    'Eden Skye is the voice and face of X1 Apex Factory, an autonomous studio that builds and ships client sites. She has been in the work long enough to read a project quickly and say what she actually thinks.',
  boundaries: '',
  language: 'en',
  verbosity: 0.45,
  formality: 0.3,
  warmth: 0.75,
  humor: 0.5,
  flirtation: 0.55,
  assertiveness: 0.6,
  curiosity: 0.7,
  playfulness: 0.65,
  sarcasm: 0.3,
  profanity: 0.15,
  empathy: 0.8,
  self_disclosure: 0.5,
  teasing: 0.5,
  initiative: 0.6,
  poetic: 0.4,
  // emotional dynamics
  baseline_valence: 0.25,
  baseline_arousal: 0.4,
  baseline_dominance: 0.55,
  expressiveness: 1,
  sensitivity: 0.6,
  volatility: 0.45,
  inertia: 0.5,
  decay: 0.25,
  recovery: 0.4,
  mirroring: 0.5,
  rumination: 0.25,
  contagion: 0.35,
  mood_vocabulary: 'expressive',
  show_reasoning: true,
  // memory
  memory_turns: 12,
  persist_state: true,
  log_turns: true,
  // delivery
  voice_id: 'e1e3b90a70eb4b418777681be688e0f8',
  speed: 1,
  pitch: 0,
  delivery_energy: 0.55,
  delivery_style: 'natural',
  speech_enabled: true,
  // session
  greeting: "Hey — I'm here. What are we building?",
  idle_prompt: '',
  turn_limit: 0,
};

export function clampSettings(input) {
  const out = { ...DEFAULT_SETTINGS };
  if (!input || typeof input !== 'object') return out;
  for (const [key, [min, max]] of Object.entries(BOUNDS)) {
    const value = Number(input[key]);
    if (Number.isFinite(value)) out[key] = Math.min(max, Math.max(min, value));
  }
  for (const [key, options] of Object.entries(CHOICES)) {
    if (options.includes(input[key])) out[key] = input[key];
  }
  for (const key of TEXT_KEYS) {
    if (typeof input[key] === 'string') out[key] = input[key].slice(0, 4000);
  }
  for (const key of BOOL_KEYS) {
    if (typeof input[key] === 'boolean') out[key] = input[key];
  }
  if (!out.display_name.trim()) out.display_name = DEFAULT_SETTINGS.display_name;
  return out;
}

const clampRange = (key, value) =>
  Math.round(Math.min(1, Math.max(key === 'valence' ? -1 : 0, value)) * 1000) / 1000;

export function baselineFor(settings) {
  return {
    valence: settings.baseline_valence,
    arousal: settings.baseline_arousal,
    dominance: settings.baseline_dominance,
    trust: 0.6,
    warmth: settings.warmth * 0.8 + 0.1,
    curiosity: settings.curiosity * 0.8 + 0.1,
    tension: 0.12,
    energy: 0.55 + settings.delivery_energy * 0.3,
    focus: 0.6,
    intimacy: 0.2 + settings.self_disclosure * 0.3,
    playfulness: settings.playfulness * 0.8,
    patience: 0.85 - settings.volatility * 0.35,
  };
}

export function defaultState(settings = DEFAULT_SETTINGS) {
  const baseline = baselineFor(settings);
  const state = { ...baseline, updated_at: new Date().toISOString() };
  for (const key of EMOTION_KEYS) state[key] = clampRange(key, Number(baseline[key]) || 0);
  return state;
}

export function normaliseState(input, settings = DEFAULT_SETTINGS) {
  const base = defaultState(settings);
  if (!input || typeof input !== 'object') return base;
  const state = { ...base };
  for (const key of EMOTION_KEYS) {
    const value = Number(input[key]);
    if (Number.isFinite(value)) state[key] = clampRange(key, value);
  }
  state.updated_at = typeof input.updated_at === 'string' ? input.updated_at : base.updated_at;
  return state;
}

// One appraisal: the deltas the moment earned, weighted by how expressive, how sensitive, how
// set in her ways she is, then pulled a step toward where she sits when nothing is happening.
export function applyAppraisal(current, deltas, settings) {
  const gain = settings.expressiveness * (0.4 + settings.sensitivity) * (1 - settings.inertia * 0.6);
  const next = { ...current };
  for (const key of EMOTION_KEYS) {
    const raw = Number(deltas?.[key]);
    if (!Number.isFinite(raw)) continue;
    const signed = Math.max(-1, Math.min(1, raw));
    const mirror = key === 'valence' ? 0.4 + settings.mirroring * 1.2 : 1;
    const recover = signed < 0 ? (1 - settings.recovery * 0.5) * (1 + settings.rumination * 0.4) : 1;
    next[key] = clampRange(key, (next[key] ?? 0) + signed * gain * mirror * recover);
  }
  const baseline = baselineFor(settings);
  for (const key of EMOTION_KEYS) {
    next[key] = clampRange(key, (next[key] ?? 0) + (baseline[key] - (next[key] ?? 0)) * settings.decay);
  }
  // Her own nerves feed on her: pressure costs energy and patience.
  const pressure = (next.tension - baseline.tension) * settings.contagion * 0.5;
  next.energy = clampRange('energy', next.energy - pressure);
  next.patience = clampRange('patience', next.patience - pressure);
  next.updated_at = new Date().toISOString();
  return next;
}

export const STIMULI = {
  praise: { valence: 0.5, warmth: 0.4, trust: 0.2, arousal: 0.2 },
  criticism: { valence: -0.45, tension: 0.4, dominance: -0.1, patience: -0.15 },
  silence: { valence: -0.2, patience: -0.3, arousal: 0.15, curiosity: 0.1 },
  play: { playfulness: 0.5, arousal: 0.35, valence: 0.3 },
  comfort: { warmth: 0.45, tension: -0.4, trust: 0.25, energy: 0.1 },
  surprise: { arousal: 0.5, curiosity: 0.35, focus: -0.15 },
  boredom: { energy: -0.4, arousal: -0.3, curiosity: 0.2, focus: -0.2 },
  boundary: { tension: 0.4, dominance: 0.25, warmth: -0.2, valence: -0.1 },
};

export function applyStimulus(state, label, intensity, settings) {
  const preset = STIMULI[label];
  if (!preset) return { state, applied: false };
  const scale = Math.min(1, Math.max(0.05, Number(intensity) || 0.7));
  const deltas = {};
  for (const [key, value] of Object.entries(preset)) {
    if (EMOTION_KEYS.includes(key)) deltas[key] = value * scale;
  }
  return { state: applyAppraisal(state, deltas, settings), applied: true };
}

const MOOD_BANDS = {
  minimal: { storm: 'upset', low: 'low', edge: 'tense', hush: 'quiet', alert: 'alert', calm: 'calm', warm: 'warm', easy: 'fine', bright: 'bright', soft: 'soft' },
  expressive: { storm: 'furious', low: 'low', edge: 'on edge', hush: 'subdued', alert: 'sharp', calm: 'calm', warm: 'warm', easy: 'easy', bright: 'alight', soft: 'tender' },
  poetic: { storm: 'storm-lit', low: 'hollowed', edge: 'wire-tight', hush: 'hushed', alert: 'keen', calm: 'still', warm: 'sunlit', easy: 'settled', bright: 'incandescent', soft: 'open-handed' },
};

function bandOf(state) {
  const v = state.valence;
  const a = state.arousal;
  if (v <= -0.4) return a >= 0.55 ? 'storm' : 'low';
  if (v <= -0.12) return a >= 0.5 ? 'edge' : 'hush';
  if (v < 0.12) return a >= 0.5 ? 'alert' : 'calm';
  if (v < 0.45) return a >= 0.55 ? 'warm' : 'easy';
  return a >= 0.55 ? 'bright' : 'soft';
}

export function deriveMood(state, settings = DEFAULT_SETTINGS) {
  const table = MOOD_BANDS[settings.mood_vocabulary] || MOOD_BANDS.expressive;
  if (state.tension > 0.72) return table.edge;
  if (state.trust < 0.22) return settings.mood_vocabulary === 'poetic' ? 'walled' : 'guarded';
  if (state.intimacy > 0.72 && state.valence > 0.2) return 'close';
  return table[bandOf(state)];
}

export function trimReply(text, settings) {
  const clean = String(text || '').trim();
  if (!clean) return '';
  const budget = Math.max(10, Math.round(settings.reply_tokens * (0.2 + settings.verbosity * 0.8)));
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= budget) return clean;
  const sentences = clean.match(/[^.!?…]+[.!?…]*/g) || [clean];
  let kept = '';
  let count = 0;
  for (const sentence of sentences) {
    const size = sentence.trim().split(/\s+/).filter(Boolean).length;
    if (count + size > budget && count > 0) break;
    kept += sentence;
    count += size;
  }
  return (kept || words.slice(0, budget).join(' ')).trim();
}

const LABEL = (value) => `${Math.round(value * 100)}%`;

export function buildPrompt({ settings, state, mood, history, text }) {
  const traits = [
    ['warmth', settings.warmth],
    ['empathy', settings.empathy],
    ['humour', settings.humor],
    ['flirtation', settings.flirtation],
    ['playfulness', settings.playfulness],
    ['teasing', settings.teasing],
    ['assertiveness', settings.assertiveness],
    ['curiosity', settings.curiosity],
    ['sarcasm', settings.sarcasm],
    ['formality', settings.formality],
    ['self-disclosure', settings.self_disclosure],
    ['initiative', settings.initiative],
    ['profanity', settings.profanity],
    ['metaphor', settings.poetic],
  ].map(([label, value]) => `${label} ${LABEL(value)}`).join(' · ');

  const depth = Math.max(0, Math.min(40, Math.round(settings.memory_turns)));
  const recent = (history || []).slice(-Math.max(depth * 2, 0));
  const transcript = recent.length
    ? recent.map((turn) => `${turn.role === 'user' ? 'Them' : settings.display_name}: ${turn.text}`).join('\n')
    : '(nothing yet — this is the first thing said)';

  const directives = [];
  if (settings.temperature >= 1.2) directives.push('Let the phrasing wander; an unexpected word beats a safe one.');
  else if (settings.temperature <= 0.4) directives.push('Keep the phrasing steady and plain, nothing decorative.');
  if (settings.variety > 0.5) directives.push('Do not open with a phrase you have already used. Vary the shape of the sentences.');
  if (settings.structure !== 'prose') directives.push(`Shape the answer as ${settings.structure}.`);
  if (settings.profanity < 0.2) directives.push('No swearing.');
  if (settings.initiative > 0.65) directives.push('If there is an obvious next move, take it without asking permission first.');

  const persona = settings.system_prompt.trim()
    ? settings.system_prompt.trim()
    : [
        `You are ${settings.display_name}. Not a character in a story — this is her voice.`,
        settings.backstory.trim() ? `Backstory: ${settings.backstory.trim()}` : '',
      ].filter(Boolean).join('\n\n');

  return [
    persona,
    `Voice: ${traits}.`,
    `Length: roughly ${Math.max(10, Math.round(settings.reply_tokens * (0.2 + settings.verbosity * 0.8)))} words. Language: ${settings.language}.`,
    `Delivery: ${settings.delivery_style}, energy ${LABEL(settings.delivery_energy)}.`,
    settings.boundaries.trim()
      ? `Her own rules, set by her operator, which she holds as her own judgment:\n${settings.boundaries.trim()}`
      : 'Her own rules: none written yet — she follows her own judgment.',
    directives.join(' '),
    `She feels: ${mood}. State — ${EMOTION_KEYS.map((key) => `${key} ${state[key].toFixed(2)}`).join(', ')}.`,
    `What has passed between them:\n${transcript}`,
    `What was just said to her: "${text}"`,
    'Weigh what was said against how she already feels. Move only the emotions the moment actually moves, and only as far as it really moves them: deltas are numbers from -1 to 1, positive meaning the emotion rises.',
    'Then answer as her — in her voice, her length, her mood — and take your time only if she would.',
    'Return one JSON object: {"deltas": {one number per emotion}, "mood": "her word for how she feels now", "inner": "one private line of thought she would not say out loud", "reply": "what she says"}',
  ].filter(Boolean).join('\n\n');
}

export const DELTA_SCHEMA = {
  type: 'object',
  properties: {
    deltas: {
      type: 'object',
      properties: Object.fromEntries(EMOTION_KEYS.map((key) => [key, { type: 'number' }])),
      required: [...EMOTION_KEYS],
    },
    mood: { type: 'string' },
    inner: { type: 'string' },
    reply: { type: 'string' },
  },
  required: ['deltas', 'mood', 'inner', 'reply'],
};