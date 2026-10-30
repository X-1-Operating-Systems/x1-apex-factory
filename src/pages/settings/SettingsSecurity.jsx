import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, LogOut, MailCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { SettingsCard, SettingsRow } from '@/components/settings/SettingsUI';

export default function SettingsSecurity() {
  const [me, setMe] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    base44.auth.me().then(setMe);
  }, []);

  const sendReset = async () => {
    if (!me?.email) return;
    setBusy(true);
    setNotice('');
    await base44.auth.resetPasswordRequest(me.email);
    setNotice(`Password reset link sent to ${me.email}.`);
    setBusy(false);
  };

  if (!me) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <SettingsCard title="Sign-in" description="How you access this studio.">
        <SettingsRow label="Email" hint="Used for sign-in links and password resets.">
          <span className="text-[11.5px] text-muted-foreground">{me.email}</span>
        </SettingsRow>
        <SettingsRow label="Password" hint="Sends a secure reset link to your email.">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={sendReset} disabled={busy}>
            {busy ? <Loader2 size={12} className="animate-spin" /> : <MailCheck size={12} />}
            Send reset link
          </Button>
        </SettingsRow>
        <SettingsRow label="Active session" hint="Signing out ends this session on this device.">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => base44.auth.logout()}>
            <LogOut size={12} /> Sign out
          </Button>
        </SettingsRow>
        {notice && <p className="pt-2 text-[11px] text-emerald-600">{notice}</p>}
      </SettingsCard>

      <SettingsCard title="Workspace access" description="What your account is allowed to do here.">
        <SettingsRow label="Role" hint="Admins manage members and can see every record.">
          <span className="rounded-full border border-border px-2 py-0.5 text-[10.5px] capitalize text-muted-foreground">
            {me.role || 'user'}
          </span>
        </SettingsRow>
        <SettingsRow label="Delete studio data" hint="Removes your sessions, projects and artifacts permanently.">
          <Link to="/settings/data" className="text-[11.5px] underline underline-offset-2 hover:text-foreground">
            Data controls
          </Link>
        </SettingsRow>
      </SettingsCard>
    </>
  );
}