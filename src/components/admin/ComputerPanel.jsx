import React from 'react';
import LiveFrame from '@/components/admin/LiveFrame';

/**
 * The running browser: a signed live frame plus a one-line caption.
 * Rendered as a right-hand column on wide screens and stacked under the thread otherwise.
 */
export default function ComputerPanel({ sessionId, heightClass = 'h-[300px]' }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Computer</p>
      <LiveFrame sessionId={sessionId} heightClass={heightClass} />
      <p className="text-[10.5px] leading-relaxed text-muted-foreground">
        {sessionId
          ? 'This is the running browser. Every click a run makes happens here.'
          : 'Open a session from the thread and its live browser appears here.'}
      </p>
    </div>
  );
}