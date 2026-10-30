import React, { useState } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { callVideo, payloadOf } from '@/lib/videoApi';

// What was actually said in a finished session, straight from LiveAvatar.
export default function SessionTranscript({ session }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    if (lines) {
      setOpen(!open);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await callVideo('liveavatar', 'sessions.transcript', { session_id: session.session_id });
    setBusy(false);
    if (!result.ok) {
      setError(result.error || 'No transcript for this session.');
      setOpen(true);
      return;
    }
    const payload = payloadOf(result);
    setLines(Array.isArray(payload) ? payload : payload?.transcript || []);
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={load}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-[2px] text-[10px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        {busy ? <Loader2 size={9} className="animate-spin" /> : <MessageSquare size={9} />} Transcript
      </button>
      {open && (
        <div className="w-full rounded-md bg-secondary/60 px-2 py-1.5">
          {error && <p className="text-[10px] text-destructive">{error}</p>}
          {lines && !lines.length && <p className="text-[10px] text-muted-foreground">The session recorded nothing.</p>}
          {lines?.map((line, index) => (
            <p key={index} className="text-[10.5px] leading-relaxed">
              <span className="text-muted-foreground">{line.role || line.speaker || '—'}: </span>
              {line.content || line.text || line.message || ''}
            </p>
          ))}
        </div>
      )}
    </>
  );
}