import React from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw, ScanSearch, ListPlus } from 'lucide-react';

const VERDICT_STYLE = {
  verified: { label: 'Verified', tone: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400' },
  strong: { label: 'Strong', tone: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400' },
  review: { label: 'Needs review', tone: 'border-amber-500/40 text-amber-600 dark:text-amber-400' },
  blocked: { label: 'Blocked', tone: 'border-destructive/40 text-destructive' },
  unverified: { label: 'Not verified', tone: 'border-border text-muted-foreground' },
};

const stamp = (iso) => (iso ? new Date(iso).toLocaleString() : 'never');

export default function TrustHeader({ state, busy, onVerify, onAudit, onEvolve }) {
  const { score, verdict, latest, findings, jobs } = state;
  const style = VERDICT_STYLE[verdict] || VERDICT_STYLE.unverified;
  const passed = (latest?.observations || []).filter((item) => item.passed).length;
  const total = (latest?.observations || []).length;
  const open = (findings || []).length;
  const queued = (jobs || []).filter((job) => ['brief_ready', 'planning', 'plan_ready'].includes(job.status)).length;

  return (
    <section className="rounded-lg border border-border bg-card px-3.5 py-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-border">
          {verdict === 'blocked' || verdict === 'review' ? (
            <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400" />
          ) : (
            <ShieldCheck size={16} className="text-muted-foreground" />
          )}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-heading text-[26px] leading-none tracking-tight">{score === null ? '—' : `${score}%`}</p>
            <span className={`rounded-full border px-2 py-[2px] text-[10px] ${style.tone}`}>{style.label}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {total ? `${passed} of ${total} probes passed` : 'No verification has run yet'} · evidence {stamp(latest?.observed_at)}
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onVerify}
            disabled={Boolean(busy)}
            className="flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11.5px] font-medium text-background transition-opacity disabled:opacity-50"
          >
            <RefreshCw size={12} className={busy === 'verify' ? 'animate-spin' : ''} />
            {busy === 'verify' ? 'Verifying…' : 'Verify everything'}
          </button>
          <button
            type="button"
            onClick={onAudit}
            disabled={Boolean(busy)}
            className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <ScanSearch size={12} className={busy === 'audit' ? 'animate-pulse' : ''} />
            {busy === 'audit' ? 'Auditing…' : 'Audit'}
          </button>
          <button
            type="button"
            onClick={onEvolve}
            disabled={Boolean(busy) || open === 0}
            className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <ListPlus size={12} />
            {busy === 'evolve' ? 'Queueing…' : `Queue ${open || ''} fix${open === 1 ? '' : 'es'}`.trim()}
          </button>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-2.5">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Open findings</dt>
          <dd className="text-[13px]">{open}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Queued fixes</dt>
          <dd className="text-[13px]">{queued}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Revision</dt>
          <dd className="truncate text-[13px]">{latest?.revision || '—'}</dd>
        </div>
      </dl>
    </section>
  );
}