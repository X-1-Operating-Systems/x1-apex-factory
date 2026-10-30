import { base44 } from '@/api/base44Client';

export const DEFAULT_PREFERENCES = {
  density: 'comfortable',
  motion: 'full',
  language: 'en',
  timezone: 'America/New_York',
  digest_email: true,
  task_alerts: true,
  release_alerts: true,
  weekly_summary: false,
};

export const LANGUAGES = [
  ['en', 'English'],
  ['es', 'Español'],
  ['fr', 'Français'],
  ['de', 'Deutsch'],
  ['pt', 'Português'],
  ['ja', '日本語'],
];

export function applyPreferences(prefs) {
  const root = document.documentElement;
  root.dataset.density = prefs.density || 'comfortable';
  root.dataset.motion = prefs.motion || 'full';
  root.lang = prefs.language || 'en';
}

function pickKnown(prefs) {
  return Object.fromEntries(Object.keys(DEFAULT_PREFERENCES).map((key) => [key, prefs[key]]));
}

export async function loadPreferences() {
  const page = await base44.entities.StudioPreference.list({ limit: 1 });
  const record = page.items[0] || null;
  const prefs = { ...DEFAULT_PREFERENCES, ...(record ? pickKnown(record) : {}) };
  applyPreferences(prefs);
  return { record, prefs };
}

export async function savePreferences(patch) {
  const { record, prefs } = await loadPreferences();
  const next = { ...prefs, ...patch };
  const payload = pickKnown(next);
  const saved = record
    ? await base44.entities.StudioPreference.update(record.id, payload)
    : await base44.entities.StudioPreference.create(payload);
  applyPreferences(payload);
  return { record: saved, prefs: payload };
}