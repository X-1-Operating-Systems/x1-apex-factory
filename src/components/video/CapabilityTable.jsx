import React from 'react';
import { Check, CircleDashed } from 'lucide-react';

export default function CapabilityTable({ entries }) {
  if (!entries?.length) return null;
  const proven = entries.filter((entry) => entry.verified).length;

  return (
    <section className="mt-3 rounded-lg border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3.5 py-2.5">
        <h2 className="font-heading text-[13px] tracking-tight">API surface</h2>
        <span className="text-[10.5px] text-muted-foreground">
          {proven} of {entries.length} routes proven on this account
        </span>
      </header>
      <div className="max-h-[340px] overflow-y-auto scroll-thin">
        {entries.map((entry) => (
          <div key={entry.action} className="flex items-start gap-2 border-b border-border/60 px-3.5 py-2 last:border-0">
            {entry.verified ? (
              <Check size={11} className="mt-[3px] shrink-0 text-emerald-600" />
            ) : (
              <CircleDashed size={11} className="mt-[3px] shrink-0 text-muted-foreground/60" />
            )}
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px]">
                {entry.action}
                <span className="ml-1.5 text-[9.5px] uppercase tracking-[0.06em] text-muted-foreground">
                  {entry.method}
                  {entry.confirm ? ' · confirmed' : ''}
                  {entry.requires?.length ? ` · ${entry.requires.join(', ')}` : ''}
                </span>
              </p>
              <p className="text-[10.5px] leading-relaxed text-muted-foreground">{entry.describe}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}