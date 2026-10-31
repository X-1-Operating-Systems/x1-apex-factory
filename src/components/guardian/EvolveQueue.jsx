import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const STATE_TONE = {
  brief_ready: 'border-border text-muted-foreground',
  planning: 'border-amber-500/40 text-amber-600 dark:text-amber-400',
  plan_ready: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
  plan_failed: 'border-destructive/40 text-destructive',
};

export default function EvolveQueue({ jobs }) {
  const rows = jobs || [];
  const waiting = rows.filter((job) => ['brief_ready', 'planning', 'plan_ready'].includes(job.status));

  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex items-baseline justify-between border-b border-border px-3.5 py-2.5">
        <h2 className="font-heading text-[13px] tracking-tight">Evolution queue</h2>
        <span className="text-[10.5px] text-muted-foreground">{waiting.length} awaiting work</span>
      </header>

      {rows.length === 0 ? (
        <p className="px-3.5 py-4 text-[11px] leading-relaxed text-muted-foreground">
          Nothing queued. When a probe or an audit finding fails, queue it here and it becomes a brief the builder picks up.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((job) => (
            <li key={job.id} className="px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-1.5 py-[1px] text-[9.5px] uppercase tracking-[0.06em] ${STATE_TONE[job.status] || 'border-border text-muted-foreground'}`}>
                  {job.status.replace('_', ' ')}
                </span>
                <p className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-muted-foreground">{job.criterion_id}</p>
                <span className="shrink-0 text-[9.5px] text-muted-foreground">{job.route}</span>
              </div>
              {job.plan && (
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed whitespace-pre-line">{job.plan}</p>
              )}
              <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                <ArrowUpRight size={9} /> revision {job.revision}
              </p>
              {job.task_id && (
                <Link
                  to={`/task/${job.task_id}`}
                  className="mt-1 inline-flex items-center gap-1 text-[10px] text-foreground underline underline-offset-2 hover:no-underline"
                >
                  <ArrowUpRight size={9} /> the coding run
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}