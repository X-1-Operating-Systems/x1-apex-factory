import React, { useState } from 'react';
import { Plus, ArrowUp, Presentation, Code2, Gamepad2, Video } from 'lucide-react';

const CHIPS = [
  { label: 'Create slides', icon: Presentation, brief: 'Create slides for ', isNew: false },
  { label: 'Build website', icon: Code2, brief: 'Build website for ', isNew: false },
  { label: 'Create games', icon: Gamepad2, brief: 'Create game for ', isNew: true },
  { label: 'Video', icon: Video, brief: 'Video for ', isNew: true },
];

export default function Composer({ onSubmit, onBlank }) {
  const [text, setText] = useState('');
  const active = Boolean(text.trim());

  const send = () => {
    if (!active) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <div className="w-full">
      <div className="composer-shell rounded-[22px] px-4 pb-3 pt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          aria-label="Assign a task or ask anything"
          placeholder="Assign a task or ask anything"
          className="min-h-[52px] w-full resize-none bg-transparent px-1 text-[14.5px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />

        <div className="mt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={onBlank}
            aria-label="Attach or start from a template"
            className="grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary"
          >
            <Plus size={18} strokeWidth={1.7} />
          </button>

          <button
            type="button"
            onClick={send}
            disabled={!active}
            aria-label="Start the task"
            className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
              active ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
            }`}
          >
            <ArrowUp size={17} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {CHIPS.map(({ label, icon: Icon, brief, isNew }) => (
          <button
            key={label}
            type="button"
            onClick={() => setText(brief)}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[12.5px] text-foreground transition-colors hover:bg-secondary"
          >
            <Icon size={14} strokeWidth={1.7} className="text-muted-foreground" />
            {label}
            {isNew && (
              <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium leading-none text-blue-600">
                New
              </span>
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={onBlank}
          className="rounded-full px-3 py-2 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
        >
          More
        </button>
      </div>
    </div>
  );
}