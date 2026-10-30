import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { SettingsCard, SettingsRow, Segmented } from '@/components/settings/SettingsUI';
import { LANGUAGES, loadPreferences, savePreferences } from '@/lib/preferences';

const STORAGE_KEY = 'x1-studio-theme';

export default function SettingsAppearance() {
  const [prefs, setPrefs] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setTheme(localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light');
    loadPreferences().then(({ prefs: loaded }) => setPrefs(loaded));
  }, []);

  const update = async (patch) => {
    const { prefs: saved } = await savePreferences(patch);
    setPrefs(saved);
  };

  const setThemeMode = (next) => {
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  if (!prefs) return <p className="text-[11.5px] text-muted-foreground">Loading appearance…</p>;

  return (
    <>
      <SettingsCard title="Theme" description="Applies everywhere in the studio.">
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'light', label: 'Light', icon: Sun },
            { key: 'dark', label: 'Dark', icon: Moon },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setThemeMode(key)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                theme === key ? 'border-foreground/25 bg-accent' : 'border-border hover:bg-secondary/60'
              }`}
            >
              <Icon size={14} />
              <span className="text-[12px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Layout & motion">
        <SettingsRow label="Density" hint="Compact tightens spacing across lists and panels.">
          <Segmented
            options={[['comfortable', 'Comfortable'], ['compact', 'Compact']]}
            value={prefs.density}
            onChange={(density) => update({ density })}
          />
        </SettingsRow>
        <SettingsRow label="Motion" hint="Reduced turns off transitions and animations.">
          <Segmented
            options={[['full', 'Full'], ['reduced', 'Reduced']]}
            value={prefs.motion}
            onChange={(motion) => update({ motion })}
          />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="Language" description="Interface language for this account.">
        <SettingsRow label="Interface language">
          <select
            value={prefs.language}
            onChange={(e) => update({ language: e.target.value })}
            className="h-8 rounded-md border border-input bg-transparent px-2 text-[11.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {LANGUAGES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </SettingsRow>
      </SettingsCard>
    </>
  );
}