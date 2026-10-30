import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SettingsCard, SettingsRow } from '@/components/settings/SettingsUI';
import { Switch } from '@/components/ui/switch';
import { loadPreferences, savePreferences } from '@/lib/preferences';

const TOGGLES = [
  ['digest_email', 'Daily digest email', 'One summary of finished sessions each morning.'],
  ['task_alerts', 'Task alerts', 'Notify me when a session finishes or fails.'],
  ['release_alerts', 'Release alerts', 'Notify me when a release is ready for approval.'],
  ['weekly_summary', 'Weekly studio summary', 'Usage and output recap every Monday.'],
];

export default function SettingsNotifications() {
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    loadPreferences().then(({ prefs: loaded }) => setPrefs(loaded));
  }, []);

  const update = async (patch) => {
    const { prefs: saved } = await savePreferences(patch);
    setPrefs(saved);
  };

  if (!prefs) return <p className="text-[11.5px] text-muted-foreground">Loading preferences…</p>;

  return (
    <>
      <SettingsCard
        title="Notifications"
        description="Choose what reaches you. In-app messages always appear in your inbox."
      >
        {TOGGLES.map(([key, label, hint]) => (
          <SettingsRow key={key} label={label} hint={hint}>
            <Switch checked={Boolean(prefs[key])} onCheckedChange={(value) => update({ [key]: value })} />
          </SettingsRow>
        ))}
      </SettingsCard>

      <Link to="/notifications" className="inline-block text-[11.5px] underline underline-offset-2 text-muted-foreground hover:text-foreground">
        Open your notification inbox
      </Link>
    </>
  );
}