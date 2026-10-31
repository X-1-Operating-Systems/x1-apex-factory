import React from 'react';
import { ExternalLink, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CeilingBar from '@/components/autopilot/CeilingBar';

const STATUS = {
  queued: 'Waiting',
  running: 'Working',
  done: 'Done',
  failed: 'Stopped',
  stopped: 'Stopped',
  awaiting_approval: 'Release approval required',
};

export default function JobCard({ job, onStop }) {
  const active = job.status === 'queued' || job.status === 'running';
  const steps = job.steps || [];

  return (
    <article className="rounded-lg border border-border bg-card px-3.5 py-3">
      <header className="flex flex-wrap items-center gap-2">
        <h3 className="font-heading text-[13px] tracking-tight">{job.project_name || 'Planning'}</h3>
        <span className="rounded-full border border-border px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.06em] text-muted-foreground">
          {STATUS[job.status] || job.status}
        </span>
        <span className="text-[10px] text-muted-foreground">{job.stage}</span>
        {active && (
          <Button size="sm" variant="outline" className="ml-auto h-7 rounded-full px-2.5" onClick={() => onStop(job)}>
            <Square size={10} className="mr-1" /> Stop
          </Button>
        )}
        {job.live_url && (
          <a
            href={job.live_url}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-1 text-[10.5px] underline underline-offset-2 ${active ? '' : 'ml-auto'}`}
          >
            Live <ExternalLink size={10} />
          </a>
        )}
      </header>

      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{job.command}</p>

      <CeilingBar ceiling={job.ceiling} />

      {steps.length > 0 && (
        <ul className="mt-2 space-y-1">
          {steps.slice(-8).map((step, index) => (
            <li key={`${step.key}_${index}`} className="text-[10.5px] leading-relaxed">
              <span className="mr-1 inline-block w-1.5 shrink-0 rounded-full bg-foreground/40 align-middle" style={{ height: 4 }} />
              <span className="text-foreground">{step.label}</span>
              {step.detail && <span className="text-muted-foreground"> — {step.detail}</span>}
            </li>
          ))}
        </ul>
      )}

      {job.browser_note && <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted-foreground">{job.browser_note}</p>}
      {job.error && <p className="mt-1.5 text-[10.5px] leading-relaxed text-destructive">{job.error}</p>}
    </article>
  );
}