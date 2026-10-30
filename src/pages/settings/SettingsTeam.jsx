import React, { useEffect, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SettingsCard } from '@/components/settings/SettingsUI';

export default function SettingsTeam() {
  const [me, setMe] = useState(null);
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    const boot = async () => {
      const user = await base44.auth.me();
      if (!live) return;
      setMe(user);
      if (user?.role === 'admin') {
        const list = await base44.entities.User.list();
        if (live) setMembers(list);
      }
    };
    boot();
    return () => {
      live = false;
    };
  }, []);

  const invite = async (event) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await base44.users.inviteUser(value, 'user');
      setNotice(`Invitation sent to ${value}.`);
      setEmail('');
      const list = await base44.entities.User.list();
      setMembers(list);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!me) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (me.role !== 'admin') {
    return (
      <SettingsCard title="Team" description="Member management is handled by workspace admins.">
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          You are signed in as a {me.role || 'user'}. Ask a workspace admin to invite people or change roles.
        </p>
      </SettingsCard>
    );
  }

  return (
    <>
      <SettingsCard title="Invite a member" description="They receive an email with a sign-in link and join as a user.">
        <form onSubmit={invite} className="flex flex-wrap items-center gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="min-w-0 flex-1"
          />
          <Button type="submit" size="sm" className="gap-1.5" disabled={busy || !email.trim()}>
            {busy ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
            Send invite
          </Button>
        </form>
        {notice && <p className="mt-2 text-[11px] text-emerald-600">{notice}</p>}
        {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
      </SettingsCard>

      <SettingsCard title={`Members (${members.length})`} description="Everyone with access to this studio.">
        <div className="divide-y divide-border">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2.5 py-2">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-medium">
                {(member.full_name || member.email || 'X').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium">{member.full_name || 'Unnamed'}</p>
                <p className="truncate text-[10.5px] text-muted-foreground">{member.email}</p>
              </div>
              <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] capitalize text-muted-foreground">
                {member.role || 'user'}
              </span>
            </div>
          ))}
        </div>
      </SettingsCard>
    </>
  );
}