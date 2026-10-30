import React from 'react';
import { AlertTriangle, Check, RotateCcw, ShieldQuestion } from 'lucide-react';

const STATUS = {
  success: [Check, 'text-emerald-600'],
  error: [AlertTriangle, 'text-destructive'],
  rollback: [RotateCcw, 'text-amber-600'],
  pending_confirmation: [ShieldQuestion, 'text-amber-600'],
};

const clock = (ts) => {
  if (!ts) return '';
  const value = Number(ts);
  return new Date(value > 1e12 ? value : value * 1000).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function ComputerActions({ actions }) {
  if (!actions?.length) {
    return <p className="text-[11.5px] text-muted-foreground">No tool activity yet.</p>;
  }

  return (
    <section>
      <p className="mb-1.5 text-[10.5px] uppercase tracking-wide text-muted-foreground">Actions</p>
      <ul className="space-y-2">
        {actions.map((action) => {
          const [Icon, tone] = STATUS[action.status] || STATUS.success;
          return (
            <li key={action.id} className="rounded-lg border border-border bg-card px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <Icon size={10} className={`shrink-0 ${tone}`} />
                <span className="truncate text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">
                  {action.tool}
                </span>
                <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{clock(action.timestamp)}</span>
              </div>
              <p className="mt-0.5 line-clamp-3 text-[11.5px] leading-snug">{action.brief || action.detail}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}