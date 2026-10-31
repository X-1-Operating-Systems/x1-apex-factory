import React from 'react';
import moment from 'moment';

export default function BridgeLog({ events }) {
  return (
    <section className="glass-panel rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] font-medium">Calls</p>
        <p className="text-[10.5px] text-muted-foreground">{events.length} recent</p>
      </div>

      {events.length === 0 ? (
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
          Nothing yet. The first call from the X1 Operating System lands here with its action, status and duration.
        </p>
      ) : (
        <div className="mt-2 divide-y divide-border">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-2 py-1.5">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${event.ok ? 'bg-foreground' : 'bg-destructive'}`}
                aria-hidden="true"
              />
              <code className="w-[92px] shrink-0 truncate font-mono text-[11px]">{event.action}</code>
              <span className="shrink-0 text-[10.5px] text-muted-foreground">{event.status || '—'}</span>
              <span className="shrink-0 text-[10.5px] text-muted-foreground">{event.ms != null ? `${event.ms} ms` : ''}</span>
              <span className="min-w-0 flex-1 truncate text-[10.5px] text-muted-foreground">{event.detail}</span>
              <span className="shrink-0 text-[10px] text-muted-foreground">{moment(event.at || event.created_date).fromNow()}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}