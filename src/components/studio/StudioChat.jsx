import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowUp, ImagePlus, Paperclip, Loader2, X } from 'lucide-react';

const SUGGESTIONS = [
  'Make this feel more premium and editorial',
  'Rewrite the hero for facility managers who need compliance proof',
  'Add a packages section and a closing call to action',
  'Tighten every line — keep the facts, cut the filler',
];

function useElapsed(busy) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!busy) {
      setSeconds(0);
      return undefined;
    }
    const started = Date.now();
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(id);
  }, [busy]);
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function StudioChat({ messages, busy, onSend }) {
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const timer = useElapsed(busy);

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
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-[9px] font-semibold text-background">
            X1
          </span>
          <p className="text-[12.5px] font-medium">apex agent</p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {busy ? (
            <>
              <Loader2 size={11} className="animate-spin" />
              <span className="tabular-nums">{timer}</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Ready
            </>
          )}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto scroll-thin px-4 py-5">
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
                  className="block w-full rounded-lg border border-border px-3 py-2 text-left text-[12px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id}>
            {m.role === 'user' ? (
              <div className="rounded-xl bg-secondary px-3.5 py-2.5">
                <p className="whitespace-pre-line text-[12.5px] leading-relaxed">{m.content}</p>
                {m.attachments?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.attachments.map((a, i) => (
                      <img key={i} src={a.file_url} alt={a.name} className="h-14 w-14 rounded-md object-cover" />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                  apex agent
                </div>
                <p className="whitespace-pre-line text-[12.5px] leading-relaxed">{m.content}</p>
                {m.summary && (
                  <p className="text-[10.5px] text-muted-foreground">{m.summary}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground" />
            </span>
            Rewriting the canvas…
          </div>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
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

      <div className="p-3">
        <div className="composer-shell rounded-[18px] px-3 pb-2.5 pt-2.5">
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
            className="w-full resize-none bg-transparent px-0.5 py-1 text-[12.5px] leading-relaxed outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between pt-1">
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
              <Paperclip size={14} />
            </button>
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
        <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
          {uploading ? 'Uploading attachment…' : 'Attachments are stored publicly — anyone with the link can open them.'}
        </p>
      </div>
    </div>
  );
}