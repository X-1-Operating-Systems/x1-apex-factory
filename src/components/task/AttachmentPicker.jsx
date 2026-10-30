import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Paperclip, X } from 'lucide-react';
import { registerFiles } from '@/lib/files';

export default function AttachmentPicker({ files, onChange, disabled, task }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const add = async (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = '';
    if (!picked.length) return;

    setBusy(true);
    setError('');
    try {
      const uploaded = [];
      for (const file of picked) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        uploaded.push({ name: file.name, file_uri, mime_type: file.type, size: file.size });
      }
      onChange([...files, ...uploaded].slice(0, 5));
      await registerFiles(uploaded, { task, source: task ? 'task' : 'studio' }).catch(() => []);
    } catch (err) {
      setError(err?.message || 'That file could not be attached.');
    } finally {
      setBusy(false);
    }
  };

  const remove = (index) => onChange(files.filter((_, i) => i !== index));

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={disabled || busy || files.length >= 5}
          aria-label="Attach files"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} strokeWidth={1.8} />}
        </button>

        {files.map((file, i) => (
          <span
            key={`${file.name}-${i}`}
            className="inline-flex max-w-[190px] items-center gap-1 rounded-full border border-border bg-card py-0.5 pl-2 pr-1 text-[10.5px] text-muted-foreground"
          >
            <span className="truncate">{file.name}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove ${file.name}`}
              className="grid h-4 w-4 shrink-0 place-items-center rounded-full hover:bg-secondary hover:text-foreground"
            >
              <X size={9} />
            </button>
          </span>
        ))}

        <input
          ref={input}
          type="file"
          multiple
          onChange={add}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}