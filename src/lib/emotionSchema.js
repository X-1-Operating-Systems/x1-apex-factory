// Every knob her mind exposes, grouped the way the settings menu shows them. Values live on the
// backend profile; this file only describes how each one is presented and what it does.
const percent = (min, max) => ({ min, max, step: 0.05, format: 'percent' });

export const MODEL_OPTIONS = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'gemini_3_8_flash', label: 'Gemini 3.8 Flash' },
  { value: 'gpt_6_luna', label: 'GPT-6 Luna' },
  { value: 'gpt_6_sol', label: 'GPT-6 Sol' },
  { value: 'gpt_6_astra', label: 'GPT-6 Astra' },
  { value: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
  { value: 'claude_opus_5_5', label: 'Claude Opus 5.5' },
  { value: 'claude_fable_5_1', label: 'Claude Fable 5.1' },
  { value: 'glm_5_2', label: 'GLM 5.2' },
];

export const LANGUAGE_OPTIONS = [
  ['en', 'English'], ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'], ['pt', 'Portuguese'],
  ['it', 'Italian'], ['nl', 'Dutch'], ['sv', 'Swedish'], ['pl', 'Polish'], ['tr', 'Turkish'],
  ['ru', 'Russian'], ['ar', 'Arabic'], ['hi', 'Hindi'], ['ja', 'Japanese'], ['ko', 'Korean'],
  ['zh', 'Chinese'], ['id', 'Indonesian'], ['vi', 'Vietnamese'], ['th', 'Thai'], ['he', 'Hebrew'],
].map(([value, label]) => ({ value, label }));

export const STRUCTURE_OPTIONS = ['prose', 'short paragraphs', 'bullets'].map((value) => ({ value, label: value }));

export const MOOD_VOCAB_OPTIONS = [
  { value: 'minimal', label: 'Plain' },
  { value: 'expressive', label: 'Expressive' },
  { value: 'poetic', label: 'Poetic' },
];

export const DELIVERY_STYLE_OPTIONS = ['natural', 'soft', 'breathy', 'confident', 'playful', 'whisper']
  .map((value) => ({ value, label: value }));

const traits = [
  ['verbosity', 'Verbosity', 'How much she says per turn.'],
  ['formality', 'Formality', 'Dressed-up and precise versus loose and casual.'],
  ['warmth', 'Warmth', 'How much heat and care sit under her words.'],
  ['humor', 'Humour', 'How readily she goes for the joke.'],
  ['flirtation', 'Flirtation', 'How much charge she lets into the exchange.'],
  ['assertiveness', 'Assertiveness', 'How hard she states a position.'],
  ['curiosity', 'Curiosity', 'How much she reaches for what she does not know.'],
  ['playfulness', 'Playfulness', 'How much she treats it as a game.'],
  ['sarcasm', 'Sarcasm', 'Dry edge, turned up or off.'],
  ['profanity', 'Profanity', 'Below 20% she is told not to swear at all.'],
  ['empathy', 'Empathy', 'How much she takes on what you are feeling.'],
  ['self_disclosure', 'Self-disclosure', 'How much of herself she offers unprompted.'],
  ['teasing', 'Teasing', 'Push and pull, provocation as affection.'],
  ['initiative', 'Initiative', 'Above 65% she acts before asking permission.'],
  ['poetic', 'Metaphor', 'How far she reaches for images instead of plain words.'],
].map(([key, label, hint]) => ({ key, label, hint, type: 'range', ...percent(0, 1) }));

export const EMOTION_SECTIONS = [
  {
    key: 'generation',
    label: 'Generation',
    blurb: 'Which mind answers her, and how the answer is asked for.',
    controls: [
      { key: 'model', label: 'Model', type: 'select', options: MODEL_OPTIONS, hint: 'Sent to the model on every turn. An unreachable model falls back to automatic.' },
      { key: 'reply_tokens', label: 'Reply ceiling', type: 'range', min: 64, max: 4096, step: 32, hint: 'Hard cap. The reply is trimmed at the last full sentence inside it.' },
      { key: 'temperature', label: 'Temperature', type: 'range', min: 0, max: 2, step: 0.05, hint: 'Pushes her phrasing to wander; at 0.4 or below she is told to keep it plain.' },
      { key: 'variety', label: 'Phrasing variety', type: 'range', ...percent(0, 1), hint: 'Above 50% she is barred from openings she has already used.' },
      { key: 'structure', label: 'Structure', type: 'select', options: STRUCTURE_OPTIONS, hint: 'The shape the answer takes.' },
      { key: 'web_context', label: 'Reach the live web', type: 'toggle', hint: 'Switches this turn to a web-capable model and lets it search.' },
    ],
  },
  {
    key: 'identity',
    label: 'Identity',
    blurb: 'Who she is. The system prompt, if written, replaces the composed voice entirely.',
    controls: [
      { key: 'display_name', label: 'Name', type: 'text', hint: 'Her name, as she knows it.' },
      { key: 'backstory', label: 'Backstory', type: 'textarea', hint: 'Composed into the persona unless a system prompt overrides it.' },
      { key: 'boundaries', label: 'Her own rules', type: 'textarea', hint: 'Written in the prompt as her own judgment. Everything is yours to write here.' },
      { key: 'system_prompt', label: 'System prompt (full override)', type: 'textarea', hint: 'Replaces the composed persona. Dynamic state, memory and delivery are still appended.' },
      { key: 'language', label: 'Language', type: 'select', options: LANGUAGE_OPTIONS, hint: 'The language she answers in.' },
    ],
  },
  {
    key: 'manner',
    label: 'Voice & manner',
    blurb: 'The personality dials. Each one is written into her prompt on every turn.',
    controls: traits,
  },
  {
    key: 'dynamics',
    label: 'Emotional dynamics',
    blurb: 'How a moment moves her, and how fast she comes back to herself.',
    controls: [
      { key: 'baseline_valence', label: 'Baseline valence', type: 'range', min: -1, max: 1, step: 0.05, hint: 'The mood she returns to when nothing is happening. Negative is low, positive is bright.' },
      { key: 'baseline_arousal', label: 'Baseline arousal', type: 'range', ...percent(0, 1), hint: 'Her resting intensity.' },
      { key: 'baseline_dominance', label: 'Baseline dominance', type: 'range', ...percent(0, 1), hint: 'How much she holds the room at rest.' },
      { key: 'expressiveness', label: 'Expressiveness', type: 'range', min: 0, max: 2, step: 0.05, hint: 'Multiplier on every emotional movement. 0 is stone, 2 is operatic.' },
      { key: 'sensitivity', label: 'Sensitivity', type: 'range', ...percent(0, 1), hint: 'How much of a moment it takes to land.' },
      { key: 'volatility', label: 'Volatility', type: 'range', ...percent(0, 1), hint: 'The size of her swings.' },
      { key: 'inertia', label: 'Inertia', type: 'range', ...percent(0, 1), hint: 'How set in her ways she is; high inertia damps new movement.' },
      { key: 'decay', label: 'Return to baseline', type: 'range', ...percent(0, 1), hint: 'Share of the distance she closes toward baseline each turn.' },
      { key: 'recovery', label: 'Recovery', type: 'range', ...percent(0, 1), hint: 'How quickly wounds lose their weight.' },
      { key: 'mirroring', label: 'Mirroring', type: 'range', ...percent(0, 1), hint: 'How much your tone moves her valence.' },
      { key: 'rumination', label: 'Rumination', type: 'range', ...percent(0, 1), hint: 'How long a negative moment keeps its teeth.' },
      { key: 'contagion', label: 'Nerve contagion', type: 'range', ...percent(0, 1), hint: 'Pressure costs her energy and patience.' },
      { key: 'mood_vocabulary', label: 'Mood vocabulary', type: 'select', options: MOOD_VOCAB_OPTIONS, hint: 'The words her mood is named with.' },
      { key: 'show_reasoning', label: 'Show her private thought', type: 'toggle', hint: 'Surfaces the inner line the model returns.' },
    ],
  },
  {
    key: 'memory',
    label: 'Memory',
    blurb: 'What she carries between turns, and how long she remembers.',
    controls: [
      { key: 'memory_turns', label: 'Turns in context', type: 'range', min: 0, max: 40, step: 1, hint: 'How many past exchanges are put in front of her.' },
      { key: 'log_turns', label: 'Write turns to her history', type: 'toggle', hint: 'Off means nothing is remembered beyond this message.' },
      { key: 'persist_state', label: 'Persist her emotional state', type: 'toggle', hint: 'Off means she starts each turn from baseline.' },
      { key: 'turn_limit', label: 'Turn limit', type: 'range', min: 0, max: 500, step: 10, hint: '0 is unlimited.' },
    ],
  },
  {
    key: 'delivery',
    label: 'Delivery',
    blurb: 'The voice profile attached to every line she produces.',
    controls: [
      { key: 'voice_id', label: 'Voice id', type: 'text', hint: 'Her approved clone. Handed to her voice pipeline with each reply.' },
      { key: 'speech_enabled', label: 'Speak the reply', type: 'toggle', hint: 'Marks the line as one to voice.' },
      { key: 'delivery_style', label: 'Style', type: 'select', options: DELIVERY_STYLE_OPTIONS, hint: 'Written into the prompt and returned with the line.' },
      { key: 'speed', label: 'Speed', type: 'range', min: 0.5, max: 2, step: 0.05, hint: 'Playback rate for her voice.' },
      { key: 'pitch', label: 'Pitch', type: 'range', min: -12, max: 12, step: 1, hint: 'Semitones of shift.' },
      { key: 'delivery_energy', label: 'Energy', type: 'range', ...percent(0, 1), hint: 'Also nudges her baseline energy.' },
    ],
  },
  {
    key: 'session',
    label: 'Session',
    blurb: 'What she says when the room opens, and when nothing is said at all.',
    controls: [
      { key: 'greeting', label: 'Greeting', type: 'textarea', hint: 'Shown before the first turn.' },
      { key: 'idle_prompt', label: 'Idle line', type: 'textarea', hint: 'Returned instead of a reply when the message is empty.' },
    ],
  },
];

export const BAR_KEYS = [
  { key: 'valence', label: 'Valence', signed: true },
  { key: 'arousal', label: 'Arousal' },
  { key: 'dominance', label: 'Dominance' },
  { key: 'trust', label: 'Trust' },
  { key: 'warmth', label: 'Warmth' },
  { key: 'tension', label: 'Tension' },
  { key: 'intimacy', label: 'Intimacy' },
  { key: 'energy', label: 'Energy' },
];

export const STIMULI = [
  { key: 'praise', label: 'Praise' },
  { key: 'criticism', label: 'Criticism' },
  { key: 'comfort', label: 'Comfort' },
  { key: 'play', label: 'Play' },
];