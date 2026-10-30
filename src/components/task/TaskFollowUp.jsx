import React, { useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import AttachmentPicker from '@/components/task/AttachmentPicker';

export default function TaskFollowUp({ onSend, placeholder, disabled }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const ready = Boolean(text.trim() || files.length);

  const send = async () => {
    if (!ready || busy || disabled) return;
    setBusy(true);
    setError('');
    try {
      await onSend(text.trim(), files);
      setText('');
      setFiles([]);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-border bg-background pt-3">
      <div className="composer-shell rounded-2xl px-2 pb-2 pt-1">
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
          className="max-h-28 w-full resize-none bg-transparent px-1 py-1.5 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-end justify-between gap-2">
          <AttachmentPicker files={files} onChange={setFiles} disabled={busy} />
          <button
            type="button"
            onClick={send}
            disabled={busy || disabled || !ready}
            aria-label="Send follow-up"
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors ${
              ready && !busy && !disabled ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <ArrowUp size={13} strokeWidth={2.3} />}
          </button>
        </div>
      </div>
      {error && <p className="mt-1.5 px-1 text-[11.5px] text-destructive">{error}</p>}
    </div>
  );
}