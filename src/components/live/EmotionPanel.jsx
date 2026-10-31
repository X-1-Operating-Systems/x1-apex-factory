import React, { useEffect, useState } from 'react';
import { Brain, Loader2, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmotionSettingsDialog from '@/components/live/EmotionSettingsDialog';
import { BAR_KEYS, STIMULI } from '@/lib/emotionSchema';

const percentOf = (key, value) => {
  const number = Number(value) || 0;
  return key === 'valence' ? ((number + 1) / 2) * 100 : number * 100;
};

function Bar({ label, value, signed }) {
  const width = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="flex items-baseline justify-between text-[10.5px] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(width)}%</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${signed ? 'bg-foreground' : 'bg-foreground/80'}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

// Her emotional core: the live state vector, the turn that moved it, and one door into every
// setting it runs on.
export default function EmotionPanel() {
  const [data, setData] = useState(null);
  const [turn, setTurn] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState(null);

  const call = async (action, extra = {}) => {
    try {
      const res = await base44.functions.invoke('edenMind', { action, ...extra });
      return res.data || { ok: false, error: 'Her mind returned nothing.' };
    } catch (err) {
      const detail = err?.response?.data;
      return detail && typeof detail === 'object' ? detail : { ok: false, error: err?.message };
    }
  };

  useEffect(() => {
    call('state')
      .then((res) => {
        if (res.ok) setData(res);
        else setError(res.error || 'Her mind did not answer.');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async () => {
    const words = text.trim();
    if (!words || busy) return;
    setBusy(true);
    setError(null);
    const res = await call('respond', { text: words });
    setBusy(false);
    if (!res.ok) {
      setError(res.error || 'She did not answer.');
      return;
    }
    setData(res);
    setTurn({ reply: res.reply, inner: res.inner, her_word: res.her_word, appraisal: res.appraisal || {} });
    setText('');
  };

  const nudge = async (label) => {
    const res = await call('stimulus', { label, intensity: 0.7 });
    if (res.ok) setData(res);
    else setError(res.error || 'That nudge did not land.');
  };

  const reset = async () => {
    const res = await call('reset');
    if (res.ok) {
      setData(res);
      setTurn(null);
    } else {
      setError(res.error || 'She did not reset.');
    }
  };

  const saveSettings = async (draft) => {
    const res = await call('save', { settings: draft });
    if (!res.ok) {
      setError(res.error || 'The settings were not saved.');
      return false;
    }
    setData(res);
    return true;
  };

  const state = data?.state || {};
  // A reload should still show what she last said, not only the greeting.
  const lastLine = data
    ? [...(data.history || [])].reverse().find((entry) => entry.role === 'eden')?.text || data.settings?.greeting || ''
    : '';
  const moved = Object.entries(turn?.appraisal || {})
    .filter(([, value]) => Math.abs(Number(value) || 0) > 0.01)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 4);

  return (
    <section className="rounded-lg border border-border bg-card px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Brain size={14} className="text-muted-foreground" />
        <h2 className="font-heading text-[13px] tracking-tight">Emotional core</h2>
        {data && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-[2px] text-[10px] uppercase tracking-[0.08em]">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            {data.mood}
          </span>
        )}
        {data && (
          <span className="text-[10px] text-muted-foreground">
            {data.turns} turn{data.turns === 1 ? '' : 's'} · {data.settings?.model === 'automatic' ? 'automatic model' : data.settings?.model}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={reset}
            title="Return her to baseline"
            className="grid h-7 w-7 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw size={11} />
          </button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 rounded-full px-2.5 text-[11px]"
            disabled={!data}
            onClick={() => setSettingsOpen(true)}
          >
            <SlidersHorizontal size={11} className="mr-1" /> Advanced settings
          </Button>
        </div>
      </div>

      {loading && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Loader2 size={11} className="animate-spin" /> Reading her state…
        </p>
      )}

      {data && (
        <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2">
          {BAR_KEYS.map((bar) => (
            <Bar key={bar.key} label={bar.label} signed={bar.signed} value={percentOf(bar.key, state[bar.key])} />
          ))}
        </div>
      )}

      {turn?.inner && (
        <p className="mt-2.5 border-l-2 border-border pl-2 text-[11px] italic leading-relaxed text-muted-foreground">
          {turn.inner}
        </p>
      )}

      {turn && (
        <div className="mt-2 rounded-md border border-border px-2.5 py-2">
          <p className="whitespace-pre-wrap text-[12px] leading-relaxed">{turn.reply}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {turn.her_word && (
              <span className="rounded-full bg-secondary px-1.5 py-[1px] text-[9.5px] uppercase tracking-[0.06em] text-muted-foreground">
                she says: {turn.her_word}
              </span>
            )}
            {moved.map(([key, value]) => (
              <span key={key} className="rounded-full bg-secondary px-1.5 py-[1px] text-[9.5px] text-muted-foreground">
                {Number(value) > 0 ? '+' : ''}
                {Math.round(Number(value) * 100)} {key}
              </span>
            ))}
          </div>
        </div>
      )}

      {!turn && lastLine && (
        <p className="mt-2 rounded-md border border-border px-2.5 py-2 text-[12px] leading-relaxed">{lastLine}</p>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
        className="mt-2 flex items-center gap-2"
      >
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Say something to her — her mood moves with it"
          className="h-8 text-[12px]"
        />
        <Button type="submit" size="sm" className="h-8 rounded-full px-3 text-[11px]" disabled={busy || !text.trim()}>
          {busy ? <Loader2 size={11} className="animate-spin" /> : 'Send'}
        </Button>
      </form>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Nudge</span>
        {STIMULI.map((stimulus) => (
          <button
            key={stimulus.key}
            type="button"
            onClick={() => nudge(stimulus.key)}
            className="rounded-full border border-border px-2 py-[1px] text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {stimulus.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-1.5 text-[10.5px] leading-relaxed text-destructive">{error}</p>}

      {data && (
        <EmotionSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          settings={data.settings}
          defaults={data.defaults}
          onSave={saveSettings}
        />
      )}
    </section>
  );
}