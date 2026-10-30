import React from 'react';

const STYLES = {
  running: ['Running', 'bg-info/10 text-info border-info/30'],
  waiting: ['Waiting', 'bg-amber-500/10 text-amber-600 border-amber-500/30'],
  stopped: ['Done', 'bg-secondary text-muted-foreground border-border'],
  error: ['Failed', 'bg-destructive/10 text-destructive border-destructive/30'],
  deleted: ['Deleted', 'bg-secondary text-muted-foreground border-border'],
};

export default function StatusPill({ status }) {
  const [label, tone] = STYLES[status] || STYLES.stopped;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-[1px] text-[10px] font-medium ${tone}`}>
      {status === 'running' && <span className="h-1 w-1 animate-pulse rounded-full bg-current" />}
      {label}
    </span>
  );
}