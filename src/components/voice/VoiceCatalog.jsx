import React from 'react';
import { Check } from 'lucide-react';

const KIND = { preset: 'Preset', model: 'Model', clone: 'Clone' };

export default function VoiceCatalog({ voices = [], selectedId, onSelect }) {
  if (!voices.length) {
    return <p className="text-[12px] text-muted-foreground">No voices on the container yet.</p>;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {voices.map((voice) => {
        const active = voice.id === selectedId;
        return (
          <button
            key={voice.id}
            type="button"
            onClick={() => onSelect(voice.id)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              active ? 'border-primary bg-secondary' : 'border-border bg-card hover:bg-secondary/60'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[12.5px] font-medium">{voice.name}</span>
              {active ? (
                <Check size={13} />
              ) : (
                <span className="shrink-0 text-[9.5px] uppercase tracking-wide text-muted-foreground">
                  {KIND[voice.kind] || voice.kind}
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">
              {voice.note || voice.language || 'owned model'}
            </p>
          </button>
        );
      })}
    </div>
  );
}