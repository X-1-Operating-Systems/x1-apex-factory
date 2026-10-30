import React, { useEffect } from 'react';
import { Plus, Sparkles, X } from 'lucide-react';
import AIChat from '@/components/ai/AIChat';

export default function AIPanel({ open, onClose, chat, options, onOptionsChange }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/10" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-label="Ask the studio"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l border-border bg-background p-3.5 shadow-[-18px_0_40px_-32px_rgba(0,0,0,0.4)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border pb-2.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <Sparkles size={13} strokeWidth={1.8} className="shrink-0" />
            <p className="truncate text-[12.5px] font-medium">{chat.task?.title || 'Ask the studio'}</p>
            {chat.busy && <span className="h-1 w-1 shrink-0 animate-pulse rounded-full bg-info" />}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {chat.taskId && (
              <button
                type="button"
                onClick={chat.reset}
                aria-label="Start a new conversation"
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Plus size={12} /> New
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close assistant"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          <AIChat
            chat={chat}
            options={options}
            onOptionsChange={onOptionsChange}
            placeholder="Describe what you want built"
            hint="One thread with the studio. Describe a build, a question or a fix — it becomes a task you can follow in full."
          />
        </div>
      </aside>
    </>
  );
}