import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from 'lucide-react';

const SOURCE_COPY = {
  personal: { label: 'Personal key', tone: 'text-emerald-600', text: 'Every task you start runs on your own Manus account.' },
  workspace: { label: 'Workspace key', tone: 'text-amber-600', text: 'You are sharing the workspace key. Connect your own so your runs stay on your account.' },
  none: { label: 'Not connected', tone: 'text-destructive', text: 'No Manus key is available yet. Connect one to start tasks.' },
};

export default function AccountKeyPanel({ account, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const meta = SOURCE_COPY[account?.source] || SOURCE_COPY.none;

  const run = async (label, payload, success) => {
    setBusy(label);
    setError('');
    setNotice('');
    try {
      await base44.functions.invoke('manusAgent', payload);
      await onRefresh();
      setNotice(success);
      return true;
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
      return false;
    } finally {
      setBusy('');
    }
  };

  const connect = async () => {
    const value = key.trim();
    if (!value) return;
    const ok = await run('connect', { action: 'connectKey', key: value }, 'Your key is connected. New tasks run on your account.');
    if (ok) {
      setKey('');
      setEditing(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary">
          <KeyRound size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-[12.5px] font-medium">Manus connection</p>
            <span className={`text-[11px] font-medium ${meta.tone}`}>
              {meta.label}
              {account?.hint ? ` ${account.hint}` : ''}
            </span>
          </div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{meta.text}</p>
        </div>
      </div>

      {editing ? (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <Label className="text-[11.5px]">Manus API key</Label>
          <Input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste the key from your Manus settings"
            autoComplete="off"
          />
          <p className="text-[10.5px] leading-relaxed text-muted-foreground">
            Stored on the server and never sent back to a browser — only the last four characters are ever shown.
          </p>
          {error && <p className="text-[11.5px] text-destructive">{error}</p>}
          <div className="flex items-center gap-1.5">
            <Button size="sm" className="gap-1.5" onClick={connect} disabled={!key.trim() || busy === 'connect'}>
              {busy === 'connect' && <Loader2 size={12} className="animate-spin" />}
              Verify and save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setKey(''); setError(''); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] transition-colors hover:bg-secondary"
          >
            {account?.source === 'personal' ? 'Replace key' : 'Connect your key'}
          </button>
          {account?.ready && (
            <button
              type="button"
              onClick={() => run('test', { action: 'testKey' }, 'The key authenticated with Manus.')}
              disabled={busy === 'test'}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              {busy === 'test' ? <Loader2 size={10} className="animate-spin" /> : <ShieldCheck size={10} />} Test
            </button>
          )}
          {account?.source === 'personal' && (
            <button
              type="button"
              onClick={() => run('remove', { action: 'removeKey' }, 'Your key was removed.')}
              disabled={busy === 'remove'}
              className="rounded-full px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
            >
              Disconnect
            </button>
          )}
        </div>
      )}

      {notice && (
        <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-600">
          <CheckCircle2 size={11} /> {notice}
        </p>
      )}
    </div>
  );
}