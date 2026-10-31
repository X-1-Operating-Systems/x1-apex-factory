import React, { useState } from 'react';
import { Play, Trash2 } from 'lucide-react';
import AudioPlayer from '@/components/voice/AudioPlayer';
import { voiceCall, formatBytes } from '@/lib/voiceApi';

export default function RenderHistory({ items = [], onChanged }) {
  const [open, setOpen] = useState(null);

  const remove = async (jobId) => {
    await voiceCall('render.delete', { job_id: jobId });
    if (open === jobId) setOpen(null);
    onChanged?.();
  };

  if (!items.length) {
    return <p className="text-[12px] text-muted-foreground">Nothing rendered yet.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.job_id} className="rounded-lg border border-border bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium">{item.voice_name}</p>
              <p className="text-[11px] text-muted-foreground">
                {item.format.toUpperCase()} · {item.chars} chars · {formatBytes(item.bytes)} ·{' '}
                {String(item.created_at || '').replace('T', ' ').replace('Z', '')} ·{' '}
                {item.prosody?.emotion} · {item.prosody?.speed}×
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(open === item.job_id ? null : item.job_id)}
                className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <Play size={11} /> {open === item.job_id ? 'Hide' : 'Play'}
              </button>
              <button
                type="button"
                onClick={() => remove(item.job_id)}
                aria-label="Remove render"
                className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          {open === item.job_id && (
            <div className="mt-2 border-t border-border pt-2">
              <AudioPlayer path={item.url} label={item.job_id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}