import React, { useState } from 'react';
import { Loader2, Square } from 'lucide-react';

export default function RunStopButton({ runId, onAction }) {
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);

  const stop = async () => {
    setWorking(true);
    try {
      await onAction('runs.stop', { run_id: runId }, 'Stop run', true);
    } finally {
      setWorking(false);
      setConfirming(false);
    }
  };

  if (working) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
        <Loader2 size={10} className="animate-spin" /> Stopping
      </span>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:text-destructive"
      >
        <Square size={9} /> Stop
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={stop}
        className="rounded-md bg-destructive px-1.5 py-0.5 text-[10px] text-destructive-foreground"
      >
        Confirm stop
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
      >
        Keep running
      </button>
    </span>
  );
}