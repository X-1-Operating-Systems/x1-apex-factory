import React, { useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';

export default function TaskFollowUp({ onSend, placeholder, disabled }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    const message = text.trim();
    if (!message || busy || disabled) return;
    setBusy(true);
    setError('');
    try {
      await onSend(message);
      setText('');
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-border bg-background pt-3">
      <div className="composer-shell flex items-end gap-2 rounded-2xl px-3 py-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder={placeholder || 'Send a follow-up to this task'}
          className="max-h-28 w-full resize-none bg-transparent py-1 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={send}
          disabled={busy || disabled || !text.trim()}
          aria-label="Send follow-up"
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors ${
            text.trim() && !busy && !disabled ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
          }`}
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <ArrowUp size={13} strokeWidth={2.3} />}
        </button>
      </div>
      {error && <p className="mt-1.5 px-1 text-[11.5px] text-destructive">{error}</p>}
    </div>
  );
}