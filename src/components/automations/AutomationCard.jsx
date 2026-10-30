import React from 'react';
import moment from 'moment';
import { Clock, ExternalLink, Loader2, Play, Trash2 } from 'lucide-react';
import { nextRunLabel, scheduleLabel } from '@/lib/automationSchedule';

export default function AutomationCard({ automation, busy, onToggle, onRun, onDelete, onOpen }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onOpen(automation)}
            className="block max-w-full truncate text-left text-[12.5px] font-medium transition-colors hover:text-muted-foreground"
          >
            {automation.title}
          </button>
          <p className="mt-0.5 text-[10.5px] text-muted-foreground">{scheduleLabel(automation)}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(automation.enabled)}
          aria-label={automation.enabled ? 'Pause automation' : 'Resume automation'}
          onClick={() => onToggle(automation)}
          className={`relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors ${
            automation.enabled ? 'bg-foreground' : 'bg-border'
          }`}
        >
          <span
            className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-background transition-all ${
              automation.enabled ? 'left-[16px]' : 'left-[2px]'
            }`}
          />
        </button>
      </div>

      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{automation.instruction}</p>

      <p className="mt-2 flex items-center gap-1 text-[10.5px] text-muted-foreground">
        <Clock size={10} /> {nextRunLabel(automation)}
      </p>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="truncate text-[10.5px] text-muted-foreground">
          {automation.last_run_at ? `Last run ${moment(automation.last_run_at).fromNow()}` : 'Not run yet'}
          {automation.run_count ? ` · ${automation.run_count} runs` : ''}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onOpen(automation)}
            aria-label="View automation details"
            className="rounded-full border border-border p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ExternalLink size={11} />
          </button>
          <button
            type="button"
            onClick={() => onRun(automation)}
            disabled={busy}
            className="flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] transition-colors hover:bg-secondary disabled:opacity-50"
          >
            {busy ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
            {busy ? 'Starting' : 'Run now'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(automation)}
            aria-label="Delete automation"
            className="rounded-full border border-border p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}