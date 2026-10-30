import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, CheckCircle2, KeyRound, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { AI_MODEL, engineInfo, setEngine } from '@/lib/taskEngine';

const ENGINES = [
  {
    key: 'native',
    label: 'Studio engine',
    model: 'GPT 5.6 Sol',
    copy: 'Runs on the platform model. No key, no external account — tasks start instantly.',
  },
  {
    key: 'manus',
    label: 'Manus account',
    model: 'Your Manus plan',
    copy: 'Adds cloud browsing computers, plugins, hosted site versions and their publish flow.',
  },
];

export default function AccountKeyPanel({ account, onRefresh }) {
  const [engine, setEngineState] = useState(null);
  const [switching, setSwitching] = useState('');
  const [editing, setEditing] = useState(false);
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    engineInfo().then(setEngineState);
  }, []);

  const choose = async (next) => {
    if (next === engine?.preferred || switching) return;
    setSwitching(next);
    try {
      const info = await setEngine(next);
      setEngineState(info);
      setNotice(next === 'manus' && !info.manusReady ? 'Select engine saved — connect a Manus key below to activate it.' : 'Engine updated.');
    } finally {
      setSwitching('');
    }
  };

  const manusMeta =
    account?.source === 'personal'
      ? { label: 'Personal key', tone: 'text-emerald-600', text: `Connected ${account.hint || ''}. Runs use your own Manus account.` }
      : account?.source === 'workspace'
        ? { label: 'Workspace key', tone: 'text-amber-600', text: 'Using the shared workspace key. Connect your own to bill your account.' }
        : { label: 'Not connected', tone: 'text-muted-foreground', text: 'Optional. Connect a key to unlock browsing computers and hosted site versions.' };

  const run = async (label, payload, success) => {
    setBusy(label);
    setError('');
    setNotice('');
    try {
      await base44.functions.invoke('manusAgent', payload);
      await onRefresh();
      await engineInfo().then(setEngineState);
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
    const ok = await run('connect', { action: 'connectKey', key: value }, 'Your key is connected.');
    if (ok) {
      setKey('');
      setEditing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary">
            <Sparkles size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-medium">Execution engine</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
              Tasks, agents and automations run on {AI_MODEL.replace(/_/g, ' ')} by default. Nothing else has to be
              connected for the studio to work.
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 border-t border-border pt-3">
          {ENGINES.map((option) => {
            const active = engine?.preferred === option.key;
            const blocked = option.key === 'manus' && !account?.ready;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => choose(option.key)}
                disabled={switching === option.key}
                className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  active ? 'border-foreground/25 bg-accent' : 'border-border hover:bg-secondary/60'
                }`}
              >
                <span
                  className={`mt-[2px] grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                    active ? 'border-foreground bg-foreground text-background' : 'border-border'
                  }`}
                >
                  {active && <Check size={10} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-1.5">
                    <span className="text-[12px] font-medium">{option.label}</span>
                    <span className="text-[10.5px] text-muted-foreground">{option.model}</span>
                    {blocked && <span className="text-[10px] text-amber-600">needs a key</span>}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{option.copy}</span>
                </span>
                {switching === option.key && <Loader2 size={12} className="mt-1 animate-spin text-muted-foreground" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary">
            <KeyRound size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <p className="text-[12.5px] font-medium">Manus connection</p>
              <span className={`text-[11px] font-medium ${manusMeta.tone}`}>
                {manusMeta.label} {account?.hint || ''}
              </span>
            </div>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{manusMeta.text}</p>
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
              {account?.source === 'personal' ? 'Replace key' : 'Connect a key'}
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
    </div>
  );
}