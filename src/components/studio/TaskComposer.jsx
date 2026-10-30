import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowUp, ImagePlus, Loader2, Paperclip, Plus, X } from 'lucide-react';

export default function TaskComposer({ onSend, busy }) {
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const submit = () => {
    const text = draft.trim();
    if (!text || busy) return;
    onSend(text, attachments);
    setDraft('');
    setAttachments([]);
  };

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const uploaded = [];
    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      uploaded.push({ name: file.name, file_url });
    }
    setAttachments((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="mx-auto w-full max-w-[680px]">
      <div className="rounded-[20px] border border-border bg-card px-3 pb-2 pt-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.35)]">
        {attachments.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {attachments.map((a, i) => (
              <span key={i} className="flex items-center gap-1 rounded-md bg-secondary px-1.5 py-1 text-[10.5px] text-muted-foreground">
                <ImagePlus size={11} /> {a.name.slice(0, 18)}
                <button type="button" onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))} aria-label="Remove attachment">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Message apex"
          className="max-h-32 w-full resize-none bg-transparent px-1 py-1.5 text-[13.5px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-0.5">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf,.txt,.md,.json"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Attach a file"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Attach a file"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              <Paperclip size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={busy || !draft.trim()}
            aria-label="Send"
            className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${
              draft.trim() && !busy ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
            }`}
          >
            <ArrowUp size={15} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}