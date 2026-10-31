import React from 'react';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { scoreOf } from './score';

const time = (iso) => (iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—');
const day = (iso) => (iso ? new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—');

export default function BenchmarkHistory({ runs, checkpoints }) {
  const rows = runs || [];

  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="border-b border-border px-3.5 py-2.5">
        <h2 className="font-heading text-[13px] tracking-tight">Benchmark ledger</h2>
        <p className="text-[10.5px] text-muted-foreground">
          Signed runs, newest first. A capability that stops answering shows as a regression, not a footnote.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="px-3.5 py-4 text-[11px] text-muted-foreground">No run recorded yet. Verify to start the ledger.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((run, index) => {
            const score = scoreOf(run.observations);
            const older = rows[index + 1];
            const delta = older ? score - scoreOf(older.observations) : null;
            const failed = (run.observations || []).filter((item) => !item.passed).length;
            return (
              <li key={run.id} className="flex items-center gap-2.5 px-3.5 py-2">
                {failed === 0 ? (
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle size={13} className="shrink-0 text-destructive" />
                )}
                <div className="min-w-0">
                  <p className="text-[12px]">
                    {score}% · {(run.observations || []).length} probes{failed ? ` · ${failed} failing` : ''}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {day(run.observed_at)} {time(run.observed_at)} · {run.revision} · sig {String(run.signature).slice(0, 8)}
                  </p>
                </div>
                {delta !== null && (
                  <span
                    className={`ml-auto shrink-0 text-[10.5px] ${
                      delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : delta < 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}
                  >
                    {delta > 0 ? `+${delta}` : delta < 0 ? delta : <MinusCircle size={11} className="inline" />}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {(checkpoints || []).length > 0 && (
        <div className="border-t border-border px-3.5 py-2.5">
          <p className="text-[10px] uppercase tracking-[0.09em] text-muted-foreground">Latest checkpoint</p>
          <p className="mt-1 text-[11.5px] leading-relaxed">{checkpoints[0].summary}</p>
          {checkpoints[0].next_batch && (
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">{checkpoints[0].next_batch}</p>
          )}
        </div>
      )}
    </section>
  );
}