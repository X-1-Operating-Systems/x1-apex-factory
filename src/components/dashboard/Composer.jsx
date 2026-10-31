import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Layers, Loader2, Rocket } from 'lucide-react';
import AttachmentPicker from '@/components/task/AttachmentPicker';

export default function Composer({ onSubmit, onPickTemplate, attachments = [], onAttachmentsChange, busy, seed }) {
  const [draft, setDraft] = useState('');
  const areaRef = useRef(null);

  // A card click drops its starting brief into the box, focused, ready to send.
  useEffect(() => {
    if (!seed?.n) return;
    setDraft(seed.text);
    areaRef.current?.focus();
  }, [seed?.n]);

  const submit = () => {
    if (!draft.trim() || busy) return;
    onSubmit(draft.trim());
    setDraft('');
  };

  return (
    <div className="w-full">
      <div className="rounded-[18px] border border-border bg-card px-3.5 pb-2.5 pt-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_14px_34px_-26px_rgba(0,0,0,0.35)]">
        <textarea
          ref={areaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          placeholder="Assign a task or type / for more"
          className="w-full resize-none bg-transparent px-1 py-1 text-[13.5px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-end justify-between gap-2 pt-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <AttachmentPicker
              files={attachments}
              onChange={onAttachmentsChange}
              disabled={busy}
            />
            <button
              type="button"
              onClick={onPickTemplate}
              className="flex h-7 items-center gap-1.5 rounded-full border border-border px-2.5 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Layers size={11} /> Template
            </button>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() || busy}
            aria-label="Send task"
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
              draft.trim() && !busy ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={15} strokeWidth={2.2} />}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={onPickTemplate}
          className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[12px] text-foreground transition-colors hover:bg-secondary"
        >
          <Rocket size={12} className="text-muted-foreground" /> Build website
        </button>
        <Link
          to="/templates"
          className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[12px] text-foreground transition-colors hover:bg-secondary"
        >
          <Layers size={12} className="text-muted-foreground" /> Start from a template
          <span className="rounded-full bg-secondary px-1.5 py-[1px] text-[9.5px] text-muted-foreground">New</span>
        </Link>
      </div>
    </div>
  );
}