import React from 'react';

export const FILE_TYPES = [
  { key: '', label: 'All' },
  { key: 'image', label: 'Images' },
  { key: 'document', label: 'Documents' },
  { key: 'video', label: 'Video' },
  { key: 'audio', label: 'Audio' },
];

export default function FileTypeFilter({ value, onChange }) {
  return (
    <div role="group" aria-label="Filter files by type" className="mt-2 flex flex-wrap items-center gap-1.5">
      {FILE_TYPES.map((type) => {
        const active = value === type.key;
        return (
          <button
            key={type.key || 'all'}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(type.key)}
            className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
              active
                ? 'border-foreground bg-secondary font-medium text-foreground'
                : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {type.label}
          </button>
        );
      })}
    </div>
  );
}