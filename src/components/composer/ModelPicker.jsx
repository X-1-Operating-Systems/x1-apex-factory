import React from 'react';
import { Check, ChevronDown, Gauge, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EFFORTS, MODELS, effortLabel, modelLabel } from '@/lib/taskOptions';

export default function ModelPicker({ options, onChange, disabled }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex h-7 items-center gap-1.5 rounded-full border border-border px-2.5 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
        >
          <Sparkles size={11} />
          {modelLabel(options.model)}
          <span className="text-muted-foreground/60">·</span>
          {effortLabel(options.effort)}
          <ChevronDown size={11} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[248px]">
        <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          <Sparkles size={10} /> Model
        </DropdownMenuLabel>
        {MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={() => onChange({ ...options, model: model.id })}
            className="flex items-start gap-2"
          >
            <Check size={12} className={`mt-[3px] shrink-0 ${options.model === model.id ? 'opacity-100' : 'opacity-0'}`} />
            <span className="min-w-0">
              <span className="block text-[12px] font-medium">{model.label}</span>
              <span className="block text-[10.5px] leading-snug text-muted-foreground">{model.note}</span>
            </span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          <Gauge size={10} /> Effort
        </DropdownMenuLabel>
        {EFFORTS.map((effort) => (
          <DropdownMenuItem
            key={effort.id}
            onSelect={() => onChange({ ...options, effort: effort.id })}
            className="flex items-start gap-2"
          >
            <Check size={12} className={`mt-[3px] shrink-0 ${options.effort === effort.id ? 'opacity-100' : 'opacity-0'}`} />
            <span className="min-w-0">
              <span className="block text-[12px] font-medium">{effort.label}</span>
              <span className="block text-[10.5px] leading-snug text-muted-foreground">{effort.note}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}