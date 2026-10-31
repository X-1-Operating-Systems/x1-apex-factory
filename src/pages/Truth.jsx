import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadTruth } from '@/lib/truthApi';
import ClaimRow from '@/components/truth/ClaimRow';
import OwnershipCard from '@/components/truth/OwnershipCard';

const FACTS = [
  { key: 'heygenKey', label: 'HeyGen key' },
  { key: 'liveavatarKey', label: 'LiveAvatar key' },
  { key: 'hostKey', label: 'Browser host' },
  { key: 'manusKey', label: 'Manus key' },
  { key: 'vercelKey', label: 'Vercel key' },
  { key: 'ledgerKey', label: 'Supabase ledger' },
  { key: 'templates', label: 'Templates' },
  { key: 'tasks', label: 'Studio tasks' },
  { key: 'videoJobs', label: 'Stored renders' },
  { key: 'browserRuns', label: 'Browser runs' },
  { key: 'liveSessions', label: 'Open live rooms' },
  { key: 'automations', label: 'Automations' },
  { key: 'openFindings', label: 'Open findings' },
];

const shown = (value) => {
  if (value === null || value === undefined) return 'unreadable';
  if (typeof value === 'boolean') return value ? 'present' : 'missing';
  return value;
};

export default function Truth() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      setData(await loadTruth());
    } catch (err) {
      setError(err?.message || 'The board could not be read.');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const evidence = data?.evidence;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="display-title text-[26px]">Reality check</h1>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
            Every number below is read live from the provider or the database when this page loads. Nothing
            here is remembered, and a source that fails says so instead of showing a comfortable default.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={load} disabled={busy}>
          <RefreshCw size={13} className={busy ? 'animate-spin' : ''} />
          {busy ? 'Reading' : 'Re-read'}
        </Button>
      </div>

      {error && <p className="mt-4 rounded-lg border border-border p-3 text-[12.5px] text-destructive">{error}</p>}

      <section className="mt-6 rounded-xl border border-border bg-card px-4">
        {!data && !error && <p className="py-6 text-[12.5px] text-muted-foreground">Reading the live values…</p>}
        {data?.claims.map((claim) => (
          <ClaimRow key={claim.key} claim={claim} />
        ))}
      </section>

      {evidence && (
        <section className="mt-5 rounded-xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground">Raw readings, as returned</p>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
            {FACTS.map((fact) => (
              <div
                key={fact.key}
                className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-1"
              >
                <span className="text-[11.5px] text-muted-foreground">{fact.label}</span>
                <span className="text-[11.5px] font-medium">{shown(evidence[fact.key])}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-5 rounded-xl border border-border bg-card p-4">
        <OwnershipCard />
      </section>
    </div>
  );
}