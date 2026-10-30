export const MODELS = [
  { id: 'gpt_5_6_sol', label: 'Sol', note: 'Studio default — balanced reasoning' },
  { id: 'gpt_5_6_luna', label: 'Luna', note: 'Fastest for short jobs' },
  { id: 'gpt_5_4', label: 'GPT 5.4', note: 'Reliable generalist' },
  { id: 'claude_sonnet_5', label: 'Sonnet 5', note: 'Long-form copy and documents' },
  { id: 'gemini_3_1_pro', label: 'Gemini 3.1 Pro', note: 'Research-heavy briefs' },
];

export const EFFORTS = [
  { id: 'standard', label: 'Standard', note: 'One pass, tight output' },
  { id: 'deep', label: 'Deep', note: 'Longer plan, more detail' },
];

export const DEFAULT_OPTIONS = { model: MODELS[0].id, effort: 'standard' };

const KEY = 'x1-task-options';

export function modelLabel(id) {
  return MODELS.find((m) => m.id === id)?.label || MODELS[0].label;
}

export function effortLabel(id) {
  return EFFORTS.find((e) => e.id === id)?.label || EFFORTS[0].label;
}

export function loadTaskOptions() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      model: MODELS.some((m) => m.id === raw.model) ? raw.model : DEFAULT_OPTIONS.model,
      effort: EFFORTS.some((e) => e.id === raw.effort) ? raw.effort : DEFAULT_OPTIONS.effort,
    };
  } catch {
    return { ...DEFAULT_OPTIONS };
  }
}

export function saveTaskOptions(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
}