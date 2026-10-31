import React from 'react';

const STYLE = {
  cloned: 'border-foreground/25 bg-foreground text-background',
  wired: 'border-border bg-secondary text-foreground',
  vendor: 'border-border bg-card text-muted-foreground',
  not_cloneable: 'border-dashed border-border bg-transparent text-muted-foreground',
};

const LABEL = {
  cloned: 'Cloned',
  wired: 'Wired, unproven',
  vendor: 'Vendor',
  not_cloneable: 'Not cloneable',
};

export default function VerdictPill({ verdict }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-[2px] text-[10px] font-medium tracking-[0.01em] ${
        STYLE[verdict] || STYLE.vendor
      }`}
    >
      {LABEL[verdict] || verdict}
    </span>
  );
}