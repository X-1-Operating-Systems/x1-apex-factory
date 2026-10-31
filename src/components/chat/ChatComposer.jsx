import React, { useRef, useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import AttachmentPicker from '@/components/task/AttachmentPicker';
import ModelPicker from '@/components/composer/ModelPicker';

export default function ChatComposer({
  onSubmit,
  options,
  onOptionsChange,
  busy,
  placeholder = 'What can I do for you?',
  rows = 2,
}) {
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState([]);
  const areaRef = useRef(null);
  const ready = Boolean(draft.trim() || files.length) && !busy;

  const submit = () => {
    if (!ready) return;
    onSubmit(draft.trim(), files);
    setDraft('');
    setFiles([]);
    areaRef.current?.focus();
  };

  return (
    <div className="rounded-[20px] border border-border bg-card px-3 pb-2.5 pt-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_36px_-28px_rgba(0,0,0,0.4)] transition-colors focus-within:border-foreground/25">
      <textarea
        ref={areaRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent px-1 py-1 text-[13.5px] leading-relaxed outline-none placeholder:text-muted-foreground"
      />

      <div className="flex items-center justify-between gap-2 pt-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <AttachmentPicker files={files} onChange={setFiles} disabled={busy} />
          {options && onOptionsChange && (
            <ModelPicker options={options} onChange={onOptionsChange} disabled={busy} />
          )}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!ready}
          aria-label="Send"
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
            ready ? 'bg-foreground text-background hover:opacity-90' : 'bg-secondary text-muted-foreground'
          }`}
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={15} strokeWidth={2.2} />}
        </button>
      </div>
    </div>
  );
}