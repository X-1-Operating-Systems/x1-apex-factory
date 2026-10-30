import React from 'react';
import { AlertTriangle, ArrowUpRight, Check, Sparkles } from 'lucide-react';

const LOOK = {
  user: [ArrowUpRight, 'text-muted-foreground', 'Brief'],
  agent: [Check, 'text-emerald-600', 'Step'],
  assistant: [Sparkles, 'text-info', 'Reply'],
  error: [AlertTriangle, 'text-destructive', 'Failed'],
};

const clock = (ts) => {
  if (!ts) return '';
  const value = Number(ts);
  return new Date(value > 1e12 ? value : value * 1000).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function ComputerFeed({ events }) {
  const feed = [...events].slice(-40).reverse();

  if (!feed.length) {
    return <p className="text-[11.5px] text-muted-foreground">Nothing has run yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {feed.map((event) => {
        const [Icon, tone, label] = LOOK[event.role] || LOOK.agent;
        return (
          <li key={event.id} className="rounded-lg border border-border bg-card px-2 py-1.5">
            <div className="flex items-center gap-1.5">
              <Icon size={10} className={`shrink-0 ${tone}`} />
              <span className="text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
              <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{clock(event.ts)}</span>
            </div>
            <p className={`mt-0.5 text-[11.5px] leading-snug ${event.role === 'agent' ? 'line-clamp-2' : 'line-clamp-4'}`}>
              {event.content}
            </p>
          </li>
        );
      })}
    </ul>
  );
}