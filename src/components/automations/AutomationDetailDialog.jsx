import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Loader2, Play, Repeat } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusPill from '@/components/manus/StatusPill';
import { formatRunTime, nextRunLabel, scheduleLabel, zoneOf } from '@/lib/automationSchedule';

export default function AutomationDetailDialog({ automation, open, onOpenChange, onRun, busy }) {
  if (!automation) return null;
  const runs = Array.isArray(automation.runs) ? automation.runs : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-6 text-[15px] font-medium leading-snug">{automation.title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Schedule</p>
            <p className="mt-0.5 text-[11.5px]">{scheduleLabel(automation)}</p>
            <p className="mt-0.5 text-[10.5px] text-muted-foreground">{zoneOf(automation)}</p>
          </div>
          <div className="rounded-lg border border-border px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Next run</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11.5px]">
              <Clock size={11} className="text-muted-foreground" /> {nextRunLabel(automation)}
            </p>
            <p className="mt-0.5 text-[10.5px] text-muted-foreground">
              {automation.run_count || 0} runs recorded
            </p>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Instruction</p>
          <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-muted-foreground">
            {automation.instruction}
          </p>
        </div>

        <div className="min-h-0">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Run history</p>
            <button
              type="button"
              onClick={() => onRun(automation)}
              disabled={busy}
              className="flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] transition-colors hover:bg-secondary disabled:opacity-50"
            >
              {busy ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
              {busy ? 'Starting' : 'Run now'}
            </button>
          </div>

          {runs.length === 0 ? (
            <div className="mt-2 rounded-lg border border-dashed border-border px-3 py-6 text-center">
              <Repeat size={15} className="mx-auto text-muted-foreground" />
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">No runs yet.</p>
            </div>
          ) : (
            <ul className="mt-2 max-h-[240px] divide-y divide-border overflow-y-auto scroll-thin rounded-lg border border-border">
              {runs.map((run, index) => (
                <li key={`${run.task_id || 'run'}-${run.at}-${index}`} className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-[11.5px]">{formatRunTime(run.at)}</p>
                    <p className="truncate text-[10.5px] text-muted-foreground">
                      {run.task_id ? run.task_id.slice(0, 12) : 'No task recorded'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {run.status && <StatusPill status={run.status} />}
                    {run.task_id && (
                      <Link
                        to={`/task/${run.task_id}`}
                        onClick={() => onOpenChange(false)}
                        className="text-[11px] underline underline-offset-4"
                      >
                        Open
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}