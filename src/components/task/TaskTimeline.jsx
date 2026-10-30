import React from 'react';
import TaskEvent from '@/components/task/TaskEvent';

export default function TaskTimeline({ events, hasMore, onLoadEarlier, busy }) {
  return (
    <div className="space-y-2.5">
      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadEarlier}
            disabled={busy}
            className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            {busy ? 'Loading…' : 'Load earlier activity'}
          </button>
        </div>
      )}
      {events.length === 0 ? (
        <p className="py-10 text-center text-[12px] text-muted-foreground">No activity on this task yet.</p>
      ) : (
        events.map((event) => <TaskEvent key={event.id} event={event} />)
      )}
    </div>
  );
}