import React from 'react';
import { AlertTriangle, Check, Eye, ShieldCheck } from 'lucide-react';

const SEVERITY = {
  critical: 'text-destructive',
  high: 'text-amber-600 dark:text-amber-400',
  medium: 'text-muted-foreground',
  low: 'text-muted-foreground',
};

const KIND_LABEL = { probe: 'probe', audit: 'audit', heal: 'repair' };

export default function FindingList({ findings, resolved, busy, onResolve, onHeal, healActions }) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="border-b border-border px-3.5 py-2.5">
        <h2 className="font-heading text-[13px] tracking-tight">Guardian findings</h2>
        <p className="text-[10.5px] text-muted-foreground">
          Each one names the records it came from. Repairs below only touch data already past its own expiry.
        </p>
      </header>

      {(healActions || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-b border-border px-3.5 py-2.5">
          {healActions.map((action) => (
            <button
              key={action.key}
              type="button"
              title={action.detail}
              disabled={Boolean(busy)}
              onClick={() => onHeal(action.key)}
              className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              {busy === `heal:${action.key}` ? 'Repairing…' : action.label}
            </button>
          ))}
        </div>
      )}

      {(findings || []).length === 0 ? (
        <div className="px-3.5 py-5 text-center">
          <ShieldCheck size={16} className="mx-auto text-emerald-600 dark:text-emerald-400" />
          <p className="mt-1.5 text-[11.5px]">No open findings.</p>
          <p className="text-[10.5px] text-muted-foreground">Run an audit to look past the probes, at the records themselves.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {findings.map((finding) => (
            <li key={finding.id} className="px-3.5 py-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle size={12} className={`mt-[3px] shrink-0 ${SEVERITY[finding.severity] || SEVERITY.medium}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] leading-snug">{finding.title}</p>
                  <p className="text-[10.5px] leading-relaxed text-muted-foreground">{finding.detail}</p>
                  {finding.evidence && (
                    <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{finding.evidence}</p>
                  )}
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="rounded-full border border-border px-1.5 py-[1px] text-[9.5px] uppercase tracking-[0.06em] text-muted-foreground">
                      {KIND_LABEL[finding.kind] || finding.kind} · {finding.severity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onResolve(finding.id, 'acknowledged')}
                      disabled={Boolean(busy)}
                      className="flex items-center gap-1 rounded-full px-1.5 py-[2px] text-[10px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                    >
                      <Eye size={10} /> Acknowledge
                    </button>
                    <button
                      type="button"
                      onClick={() => onResolve(finding.id, 'resolved')}
                      disabled={Boolean(busy)}
                      className="flex items-center gap-1 rounded-full px-1.5 py-[2px] text-[10px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                    >
                      <Check size={10} /> Resolve
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(resolved || []).length > 0 && (
        <div className="border-t border-border px-3.5 py-2">
          <p className="text-[10px] uppercase tracking-[0.09em] text-muted-foreground">Recently closed</p>
          <ul className="mt-1 space-y-1">
            {resolved.slice(0, 4).map((finding) => (
              <li key={finding.id} className="truncate text-[10.5px] text-muted-foreground">
                {finding.status === 'acknowledged' ? 'Acknowledged' : 'Closed'} · {finding.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}