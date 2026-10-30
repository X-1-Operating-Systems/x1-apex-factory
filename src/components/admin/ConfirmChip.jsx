import React from 'react';
import { Button } from '@/components/ui/button';

export default function ConfirmChip({ summary, action, resolved, onConfirm, onCancel }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/60 p-2.5">
      <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Confirm</p>
      <p className="mt-0.5 text-[11.5px] leading-relaxed">{summary || action}</p>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground">{action}</p>
      {resolved ? (
        <p className="mt-2 text-[10.5px] text-muted-foreground">Confirmed</p>
      ) : (
        <div className="mt-2 flex gap-1.5">
          <Button size="sm" className="h-7 px-2.5 text-[11px]" onClick={onConfirm}>
            Run it
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[11px]" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}