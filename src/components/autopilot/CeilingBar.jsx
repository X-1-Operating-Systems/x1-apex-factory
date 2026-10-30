import React from 'react';

const TONE = {
  pass: 'text-emerald-600 dark:text-emerald-400',
  review: 'text-amber-600 dark:text-amber-400',
  block: 'text-destructive',
};

export default function CeilingBar({ ceiling }) {
  if (!ceiling || typeof ceiling.score !== 'number') return null;
  const failing = (ceiling.checks || []).filter((check) => check.status !== 'pass').slice(0, 4);

  return (
    <div className="mt-2 rounded-md border border-border bg-secondary/40 px-2.5 py-2">
      <div className="flex items-center gap-2">
        <span className="text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Ceiling</span>
        <span className={`font-heading text-[13px] tabular-nums ${TONE[ceiling.verdict] || ''}`}>{ceiling.score}/100</span>
        <span className="text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{ceiling.verdict}</span>
        <div className="ml-auto h-1 w-24 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-foreground/70"
            style={{ width: `${Math.max(4, Math.min(100, ceiling.score))}%` }}
          />
        </div>
      </div>
      {failing.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {failing.map((check) => (
            <li key={check.id} className="text-[10.5px] leading-relaxed text-muted-foreground">
              <span className={TONE[check.status] || ''}>{check.label}</span> — {check.detail}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}