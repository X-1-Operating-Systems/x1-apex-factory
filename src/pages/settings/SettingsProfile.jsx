import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SettingsCard, SettingsRow } from '@/components/settings/SettingsUI';
import { loadPreferences, savePreferences } from '@/lib/preferences';

const ZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Australia/Sydney',
  'UTC',
];

export default function SettingsProfile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [zone, setZone] = useState('America/New_York');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let live = true;
    const boot = async () => {
      const me = await base44.auth.me();
      const { prefs } = await loadPreferences();
      if (!live) return;
      setUser(me);
      setName(me?.full_name || '');
      setZone(prefs.timezone);
    };
    boot();
    return () => {
      live = false;
    };
  }, []);

  const save = async () => {
    setBusy(true);
    setNotice('');
    await base44.auth.updateMe({ full_name: name.trim() });
    await savePreferences({ timezone: zone });
    const me = await base44.auth.me();
    setUser(me);
    setNotice('Profile saved.');
    setBusy(false);
  };

  if (!user) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = (user.full_name || user.email || 'X')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <SettingsCard title="Profile" description="Shown on sessions, artifacts and shared pages.">
        <div className="flex items-center gap-3 pb-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-[13px] font-medium">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-medium">{user.full_name || 'Studio operator'}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="space-y-1">
            <Label htmlFor="full_name" className="text-[11.5px]">Full name</Label>
            <Input id="full_name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="timezone" className="text-[11.5px]">Timezone</Label>
            <select
              id="timezone"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ZONES.map((value) => (
                <option key={value} value={value}>{value.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Account">
        <SettingsRow label="Email" hint="Sign-in address for this workspace.">
          <span className="text-[11.5px] text-muted-foreground">{user.email}</span>
        </SettingsRow>
        <SettingsRow label="Role" hint="Admins can invite members and see all studio data.">
          <span className="rounded-full border border-border px-2 py-0.5 text-[10.5px] capitalize text-muted-foreground">
            {user.role || 'user'}
          </span>
        </SettingsRow>
        <SettingsRow label="Member ID" hint="Reference this when contacting support.">
          <span className="font-mono text-[10.5px] text-muted-foreground">{user.id.slice(0, 12)}…</span>
        </SettingsRow>
      </SettingsCard>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={save} disabled={busy || !name.trim()}>
          {busy && <Loader2 size={12} className="animate-spin" />}
          Save profile
        </Button>
        {notice && <span className="text-[11px] text-emerald-600">{notice}</span>}
      </div>
    </>
  );
}