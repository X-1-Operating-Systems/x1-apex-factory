import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import TaskFollowUp from '@/components/task/TaskFollowUp';

const ROLE = {
  user: 'border-border bg-secondary/60',
  agent: 'border-transparent bg-transparent py-0.5',
  assistant: 'border-border bg-card',
  error: 'border-destructive/30 bg-destructive/5 text-destructive',
};

export default function AIChat({ chat, options, onOptionsChange, placeholder, hint }) {
  const endRef = useRef(null);
  const events = chat.events || [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [events.length, chat.busy]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto scroll-thin">
        {events.length === 0 && !chat.busy ? (
          <p className="max-w-[46ch] text-[11.5px] leading-relaxed text-muted-foreground">{hint}</p>
        ) : (
          events.map((event, index) => (
            <div
              key={event.id || index}
              className={`rounded-lg border px-2.5 py-2 text-[12px] leading-relaxed ${ROLE[event.role] || ROLE.agent}`}
            >
              {event.role === 'agent' ? (
                <p className="text-[11px] text-muted-foreground">{event.content}</p>
              ) : (
                <p className="whitespace-pre-wrap">{event.content}</p>
              )}
            </div>
          ))
        )}
        {chat.busy && (
          <p className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
            <Loader2 size={10} className="animate-spin" /> Working…
          </p>
        )}
        <div ref={endRef} />
      </div>

      {chat.taskId && (
        <Link
          to={`/task/${chat.taskId}`}
          className="mt-2 inline-flex w-fit items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Open the full task <ArrowUpRight size={10} />
        </Link>
      )}

      <div className="mt-2">
        <TaskFollowUp
          onSend={chat.send}
          placeholder={placeholder || 'Ask the studio anything'}
          disabled={chat.busy}
          options={options}
          onOptionsChange={onOptionsChange}
        />
      </div>

      {chat.error && <p className="mt-1.5 text-[11.5px] text-destructive">{chat.error}</p>}
    </div>
  );
}