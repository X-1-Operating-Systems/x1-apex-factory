import React from 'react';
import StepFrame from '@/components/admin/StepFrame';

/**
 * The transcript of a run: the list of steps it took, with any frame it kept.
 * Used for the runs.messages result, whose payload is a plain array of steps.
 */
export default function TranscriptCard({ data }) {
  const steps = Array.isArray(data) ? data : [];

  return (
    <div className="rounded-lg border border-border bg-card p-2.5">
      <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Transcript</p>
      {steps.length === 0 ? (
        <p className="mt-1 text-[10.5px] text-muted-foreground">This run recorded no steps.</p>
      ) : (
        <div className="mt-1 space-y-1.5">
          {steps.map((step, index) => (
            <div key={`${step.at || index}-${index}`}>
              <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.06em]">{step.kind || 'step'}</span>{' '}
                {step.text}
              </p>
              <StepFrame frameUri={step.frame_uri} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}