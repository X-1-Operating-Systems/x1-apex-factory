import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowUp, ImagePlus, Paperclip, Sparkles, X } from 'lucide-react';

const SUGGESTIONS = [
  'Make this feel more premium and editorial',
  'Rewrite the hero for facility managers who need compliance proof',
  'Add a packages section and a closing call to action',
  'Tighten every line — keep the facts, cut the filler',
];

export default function StudioChat({ messages, busy, onSend }) {
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
    <div className="flex h-full min-h-0 flex-col bg-white/55 backdrop-blur-2xl dark:bg-white/[0.05]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary">
            <Sparkles size={13} />
          </span>
          <div className="leading-tight">
            <p className="text-[12.5px] font-semibold">Studio agent</p>
            <p className="text-[10.5px] text-muted-foreground">Full front-end + back-end editing</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${busy ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          {busy ? 'Working' : 'Ready'}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto scroll-thin px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Describe the business and the outcome. I edit the canvas directly — layout, copy, tokens, structure — and
              keep every change versioned.
            </p>
            <div className="space-y-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDraft(s)}
                  className="block w-full rounded-lg border border-border px-3 py-2 text-left text-[12px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`max-w-[92%] rounded-xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background text-foreground'
              }`}
            >
              <p className="whitespace-pre-line">{m.content}</p>
              {m.attachments?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.attachments.map((a, i) => (
                    <img key={i} src={a.file_url} alt={a.name} className="h-14 w-14 rounded-md object-cover" />
                  ))}
                </div>
              )}
              {m.summary && m.role === 'assistant' && (
                <p className="mt-2 border-t border-border pt-1.5 text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                  {m.summary}
                </p>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
            </span>
            Rewriting the canvas…
          </div>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
          {attachments.map((a, i) => (
            <span key={i} className="flex items-center gap-1 rounded-md bg-accent px-1.5 py-1 text-[10.5px] text-muted-foreground">
              <ImagePlus size={11} /> {a.name.slice(0, 18)}
              <button type="button" onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))} aria-label="Remove attachment">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-border p-3">
        <div className="rounded-xl border border-border bg-background p-2 focus-within:border-foreground/40">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="Direct the build — copy, layout, sections, tokens…"
            className="w-full resize-none bg-transparent px-1.5 py-1 text-[12.5px] leading-relaxed outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
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
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
              >
                <Paperclip size={12} /> {uploading ? 'Uploading…' : 'Attach'}
              </button>
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={busy || !draft.trim()}
              className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
              aria-label="Send"
            >
              <ArrowUp size={14} strokeWidth={2.4} />
            </button>
          </div>
        </div>
        <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
          Attachments are stored publicly — anyone with the link can open them.
        </p>
      </div>
    </div>
  );
}