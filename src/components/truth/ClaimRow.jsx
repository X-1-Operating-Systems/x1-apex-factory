import React from 'react';

const DOT = {
  ok: 'bg-foreground',
  partial: 'bg-muted-foreground',
  blocked: 'bg-destructive',
  absent: 'bg-border',
};

const LABEL = {
  ok: 'Working',
  partial: 'Partial',
  blocked: 'Blocked',
  absent: 'Not installed',
};

export default function ClaimRow({ claim }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[claim.tone] || DOT.absent}`} />
          <p className="text-[13.5px] font-medium">{claim.title}</p>
        </div>
        <span className="text-[10.5px] uppercase tracking-[0.09em] text-muted-foreground">
          {LABEL[claim.tone] || claim.tone}
        </span>
      </div>
      <p className="mt-1.5 pl-3.5 text-[12.5px] leading-relaxed text-muted-foreground">{claim.evidence}</p>
      {claim.unblocks && (
        <p className="mt-1.5 pl-3.5 text-[12px] leading-relaxed">
          <span className="text-muted-foreground">What would change it: </span>
          {claim.unblocks}
        </p>
      )}
    </div>
  );
}