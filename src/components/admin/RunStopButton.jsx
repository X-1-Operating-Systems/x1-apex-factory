import React, { useState } from 'react';
import { Loader2, Square } from 'lucide-react';

export default function RunStopButton({ runId, onAction }) {
  const [working, setWorking] = useState(false);

  const stop = async () => {
    setWorking(true);
    try {
      await onAction('runs.stop', { run_id: runId }, 'Stop run', true);
    } finally {
      setWorking(false);
    }
  };

  if (working) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
        <Loader2 size={10} className="animate-spin" /> Stopping
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={stop}
      className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:text-destructive"
    >
      <Square size={9} /> Stop
    </button>
  );
}