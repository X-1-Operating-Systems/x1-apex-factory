import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { ExternalLink, Loader2, Play, Trash2 } from 'lucide-react';

const CADENCE = {
  hourly: 'Every hour',
  daily: 'Daily',
  weekly: 'Weekly',
};

function scheduleLabel(automation) {
  const hour = String(automation.run_hour ?? 9).padStart(2, '0');
  if (automation.cadence === 'daily') return `Daily around ${hour}:00`;
  if (automation.cadence === 'weekly') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${days[automation.run_day ?? 1]} around ${hour}:00`;
  }
  return CADENCE[automation.cadence] || 'Scheduled';
}

export default function AutomationCard({ automation, busy, onToggle, onRun, onDelete }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-medium">{automation.title}</p>
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

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="truncate text-[10.5px] text-muted-foreground">
          {automation.last_run_at ? `Last run ${moment(automation.last_run_at).fromNow()}` : 'Not run yet'}
          {automation.run_count ? ` · ${automation.run_count} runs` : ''}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {automation.last_task_url ? (
            <a
              href={automation.last_task_url}
              target="_blank"
              rel="noreferrer"
              aria-label="Open the last run"
              className="rounded-full border border-border p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ExternalLink size={11} />
            </a>
          ) : (
            automation.last_task_id && (
              <Link
                to={`/task/${automation.last_task_id}`}
                aria-label="Open the last run"
                className="rounded-full border border-border p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ExternalLink size={11} />
              </Link>
            )
          )}
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