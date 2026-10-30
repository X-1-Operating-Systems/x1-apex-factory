import React, { useState } from 'react';
import { Plus, ArrowUp } from 'lucide-react';

const CHIPS = ['Build a website', 'Landing page', 'Full multi-page site', 'Rebrand an existing site'];

export default function Composer({ onSubmit, onBlank }) {
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <div className="glass-panel rounded-3xl p-3">
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
        aria-label="Describe the build"
        placeholder="Assign a build or ask anything"
        className="w-full resize-none bg-transparent px-2 pt-2 text-[14px] leading-relaxed outline-none placeholder:text-muted-foreground"
      />

      <div className="mt-1 flex items-center justify-between gap-2 px-1">
        <button
          type="button"
          onClick={onBlank}
          aria-label="Start from a template"
          className="glass-frost grid h-9 w-9 place-items-center rounded-full"
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          onClick={send}
          disabled={!text.trim()}
          aria-label="Start the build"
          className="glass-blue grid h-9 w-9 place-items-center rounded-full disabled:pointer-events-none disabled:opacity-45"
        >
          <ArrowUp size={16} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 px-1 pb-1">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setText(chip)}
            className="glass-frost rounded-full px-3 py-1.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}