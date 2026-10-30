import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import StepFrame from '@/components/admin/StepFrame';
import RunStopButton from '@/components/admin/RunStopButton';
import RunResumeButton from '@/components/admin/RunResumeButton';

const LIVE = ['RUNNING', 'PENDING', 'QUEUED'];
const RESUMABLE = ['STOPPED', 'FAILED', 'ERROR', 'TIMED_OUT', 'PAUSED'];

const STATUS_TONE = {
  COMPLETED: 'text-foreground',
  SUCCEEDED: 'text-foreground',
  RUNNING: 'text-foreground',
  PENDING: 'text-muted-foreground',
  FAILED: 'text-destructive',
  ERROR: 'text-destructive',
  STOPPED: 'text-muted-foreground',
};

export default function RunCard({ action, data, onAction }) {
  const [open, setOpen] = useState(false);
  const runId = data && (data.runId || data.id || data.run_id);
  const status = (data && (data.status || data.state)) || 'unknown';
  const output = data && (data.output || data.result);
  const steps = data && Array.isArray(data.steps) ? data.steps : [];
  const framed = steps.filter((step) => step.frame_uri).length;
  const Live = LIVE.includes(String(status).toUpperCase());
  const resumable = RESUMABLE.includes(String(status).toUpperCase());

  return (
    <div className="space-y-1.5 rounded-lg border border-border bg-card p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium">Browser run</p>
          <p className="truncate font-mono text-[10px] text-muted-foreground">{runId || 'starting'}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`text-[10px] uppercase tracking-[0.06em] ${STATUS_TONE[status] || 'text-muted-foreground'}`}>
            {status}
          </span>
          {Live && runId && onAction && <RunStopButton runId={runId} onAction={onAction} />}
          {!Live && resumable && runId && onAction && <RunResumeButton runId={runId} onAction={onAction} />}
        </div>
      </div>

      {output && (
        <pre className="max-h-[150px] overflow-auto scroll-thin whitespace-pre-wrap break-words rounded-md border border-border bg-secondary/60 p-2 font-mono text-[10px] leading-relaxed">
          {JSON.stringify(output, null, 2)}
        </pre>
      )}

      {steps.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />} {steps.length} steps
            {framed > 0 && <span className="text-[9.5px]">· {framed} framed</span>}
          </button>
          {open && (
            <div className="mt-1 space-y-1.5">
              {steps.map((step, index) => (
                <div key={`${step.at}-${index}`}>
                  <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.06em]">{step.kind}</span> {step.text}
                  </p>
                  <StepFrame frameUri={step.frame_uri} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {action === 'runs.create' && !output && (
        <p className="text-[10.5px] text-muted-foreground">Running in a real browser. The card updates as it finishes.</p>
      )}
    </div>
  );
}