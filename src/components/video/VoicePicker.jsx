import React from 'react';
import { Play } from 'lucide-react';

export default function VoicePicker({ voices = [], pinned = [], value, onChange }) {
  // A private clone is not in the catalogue page, so the approved voice is merged in by id.
  const extra = pinned.filter((voice) => voice?.voice_id && !voices.some((item) => item.voice_id === voice.voice_id));
  const pool = [...extra, ...voices];
  const current = pool.find((voice) => voice.voice_id === value) || null;

  const preview = () => {
    if (!current?.preview_audio_url) return;
    new Audio(current.preview_audio_url).play().catch(() => {});
  };

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-[11.5px] outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Avatar&apos;s default voice</option>
        {pool.map((voice) => (
          <option key={voice.voice_id} value={voice.voice_id}>
            {extra.some((item) => item.voice_id === voice.voice_id)
              ? `${voice.name} · approved`
              : `${voice.name} · ${voice.language}`}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={preview}
        disabled={!current?.preview_audio_url}
        aria-label="Preview voice"
        className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        <Play size={10} />
      </button>
    </div>
  );
}