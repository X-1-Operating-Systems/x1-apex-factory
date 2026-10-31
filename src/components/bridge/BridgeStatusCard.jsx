import React, { useState } from 'react';
import { Check, Copy, Loader2, Send, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { callX1Os, runBridgeRoundTrip } from '@/lib/bridgeApi';

export default function BridgeStatusCard({ state, onRoundTrip }) {
  const [copied, setCopied] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [osBusy, setOsBusy] = useState(false);
  const [osResult, setOsResult] = useState(null);

  const callOsNow = async () => {
    setOsBusy(true);
    setOsResult(null);
    try {
      setOsResult(await callX1Os());
    } catch (err) {
      setOsResult({ ok: false, error: err?.response?.data?.error || err.message });
    } finally {
      setOsBusy(false);
      onRoundTrip?.();
    }
  };

  const copy = async (value, tag) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(tag);
    setTimeout(() => setCopied(''), 1500);
  };

  const test = async () => {
    setBusy(true);
    setResult(null);
    try {
      setResult(await runBridgeRoundTrip());
    } catch (err) {
      setResult({ ok: false, error: err?.response?.data?.error || err.message });
    } finally {
      setBusy(false);
      onRoundTrip?.();
    }
  };

  const armed = state?.key_set === true;
  const endpoint = state?.endpoint || '';
  const header = state?.header || 'x-x1-bridge-key';

  return (
    <section className="glass-panel rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {armed ? (
            <ShieldCheck size={15} strokeWidth={1.8} />
          ) : (
            <ShieldAlert size={15} strokeWidth={1.8} className="text-destructive" />
          )}
          <p className="text-[12.5px] font-medium">{armed ? 'Bridge armed' : 'Bridge not armed'}</p>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] ${
            armed ? 'border-border text-muted-foreground' : 'border-destructive/40 text-destructive'
          }`}
        >
          {state?.secret || 'X1_BRIDGE_KEY'} {armed ? '· set' : '· missing'}
        </span>
      </div>

      <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
        {armed
          ? 'The key is held server-side and never leaves it — not even to this screen. The OS must carry the same value.'
          : 'Add a long random value to Secrets → X1_BRIDGE_KEY, and put the same value in the X1 Operating System. Until they match, every call is refused.'}
      </p>

      <div className="mt-3 space-y-1.5">
        <Row label="Endpoint" value={endpoint || '…'} copyable={Boolean(endpoint)} onCopy={() => copy(endpoint, 'endpoint')} copied={copied === 'endpoint'} />
        <Row label="Header" value={header} copyable onCopy={() => copy(header, 'header')} copied={copied === 'header'} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={test} disabled={busy || !armed} className="h-8 gap-1.5 text-[11.5px]">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          Run the round trip
        </Button>
        {result && (
          <p className={`text-[11px] ${result.ok ? 'text-muted-foreground' : 'text-destructive'}`}>
            {result.ok
              ? `Answered ${result.status} in ${result.ms} ms`
              : result.error || `Refused (${result.status || 'no answer'})`}
          </p>
        )}
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11.5px] font-medium">Outbound to the X1 OS</p>
          <span className="text-[10px] text-muted-foreground">
            {state?.os_url_set ? state.os_url : 'X1_OS_BASE_URL · not set'}
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {state?.os_url_set
            ? 'This factory can call the Operating System back, so the link runs both ways.'
            : 'Set X1_OS_BASE_URL to the Operating System\u2019s app address and the factory can call it back.'}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={callOsNow}
          disabled={osBusy || !state?.os_url_set}
          className="mt-2 h-8 gap-1.5 text-[11.5px]"
        >
          {osBusy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          Call the OS
        </Button>
        {osResult && (
          <p className={`mt-1.5 text-[11px] ${osResult.ok ? 'text-muted-foreground' : 'text-destructive'}`}>
            {osResult.ok ? `The OS answered ${osResult.status}` : osResult.error || `No answer (${osResult.status || '—'})`}
          </p>
        )}
      </div>
    </section>
  );
}

function Row({ label, value, copyable, onCopy, copied }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5">
      <span className="w-[68px] shrink-0 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      <code className="min-w-0 flex-1 truncate font-mono text-[11px]">{value}</code>
      {copyable && (
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy ${label}`}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
        </button>
      )}
    </div>
  );
}