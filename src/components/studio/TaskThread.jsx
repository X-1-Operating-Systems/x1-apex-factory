import React, { useEffect, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import DeliverableCard from '@/components/studio/DeliverableCard';

const SUGGESTIONS = [
  'Make the hero copy tighter and more premium',
  'Add a packages section before the contact block',
  'Rewrite every section for facility managers',
];

function useElapsed(busy) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!busy) {
      setSeconds(0);
      return undefined;
    }
    const started = Date.now();
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(id);
  }, [busy]);
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export default function TaskThread({ messages, busy, page, project, onOpenCanvas, onReview, qaBusy, onSend }) {
  const elapsed = useElapsed(busy);
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="space-y-6">
      {messages.length === 0 && (
        <div className="rounded-xl bg-secondary px-4 py-3 text-[13.5px] leading-relaxed text-muted-foreground">
          Describe the business and the outcome. I edit the page directly — layout, copy, tokens, structure — and keep
          every change versioned.
        </div>
      )}

      {messages.map((m) => (
        <div key={m.id}>
          {m.role === 'user' ? (
            <div className="rounded-xl bg-secondary px-4 py-3">
              <p className="whitespace-pre-line text-[13.5px] leading-[1.65]">{m.content}</p>
              {m.attachments?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.attachments.map((a, i) => (
                    <img key={i} src={a.file_url} alt={a.name} className="h-14 w-14 rounded-md object-cover" />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-foreground text-[8px] font-semibold text-background">
                  X1
                </span>
                <span className="text-[12.5px] font-semibold">apex</span>
                <span className="rounded-full border border-border px-1.5 py-[1px] text-[9.5px] text-muted-foreground">
                  Studio
                </span>
              </div>
              <p className="whitespace-pre-line text-[13.5px] leading-[1.7]">{m.content}</p>
              {m.summary && (
                <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <FileText size={11} /> {m.summary}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {busy && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[12.5px]">
            <Loader2 size={12} className="animate-spin text-info" />
            <span>Thinking</span>
            <span className="text-muted-foreground">Working for {elapsed}</span>
          </div>
          <div className="flex items-center gap-1.5 pl-[18px] text-[11.5px] text-muted-foreground">
            <FileText size={11} /> Editing page · {page?.name || 'Home'}
          </div>
        </div>
      )}

      {!busy && lastAssistant && (
        <div className="space-y-3">
          <DeliverableCard
            page={page}
            project={project}
            onOpenCanvas={onOpenCanvas}
            onReview={onReview}
            qaBusy={qaBusy}
          />
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSend(s, [])}
                className="rounded-full border border-border px-2.5 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}