import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowUp, Loader2 } from 'lucide-react';
import StatusPill from '@/components/manus/StatusPill';

export default function AgentCard({ agent }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState(null);

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    setDraft('');
    try {
      await base44.functions.invoke('manusAgent', { action: 'send', task_id: agent.task_id, message: text });
      const res = await base44.functions.invoke('manusAgent', { action: 'status', task_id: agent.task_id });
      setState(res.data);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-medium">{agent.nickname}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{agent.about || 'Custom agent'}</p>
        </div>
        {state && <StatusPill status={state.agentStatus} />}
      </div>

      {state?.answer && (
        <p className="mt-2 max-h-24 overflow-hidden whitespace-pre-line rounded-lg bg-secondary px-2.5 py-2 text-[11.5px] leading-relaxed">
          {state.answer}
        </p>
      )}

      {open ? (
        <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            placeholder={`Message ${agent.nickname}`}
            className="w-full bg-transparent text-[12px] outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={send}
            disabled={busy || !draft.trim()}
            aria-label="Send message"
            className="shrink-0 text-muted-foreground disabled:opacity-40 hover:text-foreground"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <ArrowUp size={13} />}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          Message agent
        </button>
      )}
    </div>
  );
}