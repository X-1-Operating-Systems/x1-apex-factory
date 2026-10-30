import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import LiveFrame from './LiveFrame';

const BUTTONS = [
  { action: 'sessions.logs', label: 'Logs' },
  { action: 'sessions.downloads', label: 'Downloads' },
  { action: 'sessions.replay', label: 'Replay' },
  { action: 'sessions.get', label: 'Detail' },
];

export default function SessionCard({ action, data }) {
  const sessionId = data && (data.id || data.sessionId || data.session_id);
  const status = (data && (data.status || data.state)) || 'unknown';
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(null);

  const open = async (nextAction) => {
    setLoading(nextAction);
    const res = await base44.functions.invoke('browserbase', {
      action: nextAction,
      params: { session_id: sessionId },
    });
    setDetail({ action: nextAction, payload: res.data });
    setLoading(null);
  };

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium">Session</p>
          <p className="truncate font-mono text-[10px] text-muted-foreground">{sessionId || 'no id returned'}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
          {status}
        </span>
      </div>

      {action === 'sessions.create' && <LiveFrame sessionId={sessionId} />}

      <div className="flex flex-wrap gap-1.5">
        {BUTTONS.map((button) => (
          <button
            key={button.action}
            type="button"
            onClick={() => open(button.action)}
            className="rounded-md border border-border px-2 py-1 text-[10.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {loading === button.action ? '…' : button.label}
          </button>
        ))}
      </div>

      {detail && (
        <div className="rounded-md border border-border bg-secondary/60 p-2">
          <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{detail.action}</p>
          <pre className="max-h-[160px] overflow-auto scroll-thin whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed">
            {JSON.stringify(detail.payload && (detail.payload.data ?? detail.payload), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}