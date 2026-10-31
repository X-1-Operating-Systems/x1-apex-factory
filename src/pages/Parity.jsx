import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Loader2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import RegisterRow from '@/components/parity/RegisterRow';

const GROUPS = [
  { key: 'heygen', label: 'HeyGen' },
  { key: 'liveavatar', label: 'LiveAvatar' },
];

const COUNTS = [
  { verdict: 'cloned', label: 'cloned' },
  { verdict: 'wired', label: 'wired, unproven' },
  { verdict: 'vendor', label: 'vendor only' },
  { verdict: 'not_cloneable', label: 'not cloneable' },
];

export default function Parity() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);

  const load = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('mediaParity', {});
      if (res.data?.ok === false) setError(res.data.error || 'The register could not be read.');
      else setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rows = data?.register || [];
  const probes = data?.probes || {};
  const countOf = (verdict) => rows.filter((r) => r.verdict === verdict).length;

  return (
    <div className="mx-auto w-full max-w-[760px] px-5 pb-16 pt-8 sm:pt-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-[24px] leading-tight">Parity register</h1>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
            Every HeyGen and LiveAvatar capability, what serves it here, and its verdict. Read live on load.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] transition-colors hover:bg-secondary disabled:opacity-50"
        >
          {busy ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />} Re-read
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg border border-destructive/40 px-3 py-2 text-[11.5px] text-destructive">{error}</p>}

      {busy && !data && (
        <p className="mt-8 inline-flex items-center gap-2 text-[11.5px] text-muted-foreground">
          <Loader2 size={12} className="animate-spin" /> Reading both accounts and the owned container…
        </p>
      )}

      {data && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {COUNTS.map((item) => (
              <div key={item.verdict} className="rounded-lg border border-border bg-card px-3 py-2.5">
                <p className="font-heading text-[19px] leading-none">{countOf(item.verdict)}</p>
                <p className="mt-1 text-[10px] leading-tight text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${data.owned_host?.ok ? 'bg-foreground' : 'bg-destructive'}`} />
              owned avatar host: {data.owned_host?.detail}
            </span>
            <span>read {moment(data.observed_at).format('MMM D, h:mm:ss a')}</span>
          </div>

          {GROUPS.map((group) => {
            const groupRows = rows.filter((r) => r.vendor === group.key);
            if (!groupRows.length) return null;
            return (
              <section key={group.key} className="mt-7">
                <p className="mb-2 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{group.label}</p>
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                  {groupRows.map((row) => (
                    <RegisterRow
                      key={row.id}
                      row={row}
                      probe={row.proof_action ? probes[`${row.proof_action.provider}:${row.proof_action.action}`] : null}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          <section className="mt-7">
            <p className="mb-2 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Clone map</p>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {data.clone_map.map((item) => (
                <div key={item.capability} className="px-3.5 py-3">
                  <p className="text-[12.5px] font-medium">{item.capability}</p>
                  <p className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">{item.vendor}</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed">{item.substitute}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{item.ceiling}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <p className="mb-2 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              Not cloneable, and why
            </p>
            <ul className="space-y-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
              {data.not_cloneable.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-border" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}