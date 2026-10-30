import React from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Play, Trash2 } from 'lucide-react';
import { categoryLabel } from '@/lib/agentPresets';

export default function StudioAgentCard({ agent, onRun, onEdit, onDelete }) {
  const initials = agent.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-start gap-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-medium">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-medium">{agent.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {agent.role || 'Studio agent'} · {categoryLabel(agent.category)} · {agent.run_count || 0} run
            {(agent.run_count || 0) === 1 ? '' : 's'}
          </p>
        </div>
        {agent.tone && (
          <span className="shrink-0 rounded-full border border-border px-1.5 py-[1px] text-[10px] text-muted-foreground">
            {agent.tone}
          </span>
        )}
        <button
          type="button"
          onClick={() => onDelete(agent)}
          aria-label={`Delete ${agent.name}`}
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <p className="mt-2 max-h-[34px] overflow-hidden text-[11.5px] leading-relaxed text-muted-foreground">
        {agent.instructions}
      </p>

      <div className="mt-3 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onRun(agent)}
          className="glass-blue inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
        >
          <Play size={10} /> Run
        </button>
        <button
          type="button"
          onClick={() => onEdit(agent)}
          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Pencil size={10} /> Edit
        </button>
        {agent.last_task_id && (
          <Link
            to={`/task/${agent.last_task_id}`}
            className="truncate rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Last task
          </Link>
        )}
      </div>
    </div>
  );
}