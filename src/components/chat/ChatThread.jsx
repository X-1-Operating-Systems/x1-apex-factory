import React, { useEffect, useRef } from 'react';
import { Paperclip } from 'lucide-react';

const isStep = (role) => role === 'agent' || role === 'tool' || role === 'step';

function UserBubble({ event }) {
  const files = event.attachments || [];
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%]">
        <div className="whitespace-pre-wrap rounded-2xl rounded-tr-md bg-secondary px-3.5 py-2 text-[13px] leading-relaxed">
          {event.content}
        </div>
        {files.length > 0 && (
          <div className="mt-1 flex flex-wrap justify-end gap-1">
            {files.map((file, index) => (
              <span
                key={`${file.name}-${index}`}
                className="inline-flex max-w-[200px] items-center gap-1 truncate rounded-full border border-border px-2 py-[2px] text-[10.5px] text-muted-foreground"
              >
                <Paperclip size={9} /> {file.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatThread({ events = [], busy }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [events.length, busy]);

  return (
    <div className="space-y-3">
      {events.map((event, index) => {
        if (event.role === 'user') return <UserBubble key={event.id || index} event={event} />;

        if (isStep(event.role)) {
          return (
            <div key={event.id || index} className="flex gap-2 pl-1">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">{event.content}</p>
            </div>
          );
        }

        const tone = event.role === 'error' ? 'text-destructive' : '';
        return (
          <p
            key={event.id || index}
            className={`whitespace-pre-wrap text-[13px] leading-[1.7] ${tone}`}
          >
            {event.content}
          </p>
        );
      })}

      {busy && (
        <div className="flex items-center gap-2 pl-1 text-[11.5px] text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/40" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground/60" />
          </span>
          Working…
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}