import React, { useEffect, useState } from 'react';
import { SettingsCard, SettingsRow, Segmented } from '@/components/settings/SettingsUI';
import { LANGUAGES, loadPreferences, savePreferences } from '@/lib/preferences';

export default function SettingsAppearance() {
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    loadPreferences().then(({ prefs: loaded }) => setPrefs(loaded));
  }, []);

  const update = async (patch) => {
    const { prefs: saved } = await savePreferences(patch);
    setPrefs(saved);
  };

  if (!prefs) return <p className="text-[11.5px] text-muted-foreground">Loading appearance…</p>;

  return (
    <>
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