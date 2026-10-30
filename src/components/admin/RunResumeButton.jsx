import React, { useState } from 'react';
import { Loader2, RotateCw } from 'lucide-react';

/**
 * Puts a stopped or failed run back to work. Resume is a plain write in the host
 * registry (nothing is destroyed), so it is one click, unlike Stop.
 */
export default function RunResumeButton({ runId, onAction }) {
  const [working, setWorking] = useState(false);

  const resume = async () => {
    setWorking(true);
    try {
      await onAction('runs.resume', { run_id: runId }, 'Resume run', false);
    } finally {
      setWorking(false);
    }
  };

  if (working) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
        <Loader2 size={10} className="animate-spin" /> Resuming
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={resume}
      className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <RotateCw size={9} /> Resume
    </button>
  );
}