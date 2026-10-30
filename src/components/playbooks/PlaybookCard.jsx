import React from 'react';
import { ArrowRight, ListChecks } from 'lucide-react';
import { PLAYBOOK_CATEGORIES } from '@/lib/playbooks';

const label = (key) => PLAYBOOK_CATEGORIES.find((item) => item.key === key)?.label || key;

export default function PlaybookCard({ playbook, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(playbook)}
      className="flex h-full flex-col rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/25"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label(playbook.category)}</p>
        <span className="flex items-center gap-1 rounded-full border border-border px-1.5 py-[1px] text-[10px] text-muted-foreground">
          <ListChecks size={9} /> {playbook.steps.length}
        </span>
      </div>
      <h3 className="mt-1.5 text-[14px] font-medium tracking-tight">{playbook.name}</h3>
      <p className="mt-1 line-clamp-3 flex-1 text-[11.5px] leading-relaxed text-muted-foreground">{playbook.summary}</p>
      <span className="mt-2.5 flex items-center gap-1 text-[11px] text-muted-foreground">
        Open playbook <ArrowRight size={10} />
      </span>
    </button>
  );
}