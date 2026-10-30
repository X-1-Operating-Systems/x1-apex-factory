import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { skillCategoryLabel } from '@/lib/skills';

export default function SkillCard({ skill, onToggle, onEdit, onDelete }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-start gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-medium">{skill.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {skillCategoryLabel(skill.category)}
            {skill.description ? ` · ${skill.description}` : ''}
          </p>
        </div>
        <Switch checked={Boolean(skill.enabled)} onCheckedChange={(next) => onToggle(skill, next)} />
      </div>

      <p className="mt-2 max-h-[52px] overflow-hidden text-[11.5px] leading-relaxed text-muted-foreground">
        {skill.instructions}
      </p>

      <div className="mt-3 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onEdit(skill)}
          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Pencil size={10} /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(skill)}
          aria-label={`Delete ${skill.name}`}
          className="rounded-full border border-border p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}