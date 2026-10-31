import React from 'react';
import VerdictPill from '@/components/parity/VerdictPill';

export default function RegisterRow({ row, probe }) {
  const live = probe ? (probe.ok ? 'live' : 'unreadable') : null;

  return (
    <div className="border-b border-border px-3.5 py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-[12.5px] font-medium leading-snug">{row.surface}</p>
        <VerdictPill verdict={row.verdict} />
      </div>

      <p className="mt-1 break-words font-mono text-[10.5px] text-muted-foreground">{row.vendorEndpoint}</p>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{row.note}</p>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted-foreground">
        <span>
          served by <span className="text-foreground">{row.served_by}</span>
        </span>
        {probe && (
          <span className="inline-flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${probe.ok ? 'bg-foreground' : 'bg-destructive'}`} />
            {live}: {probe.detail}
          </span>
        )}
      </div>
    </div>
  );
}