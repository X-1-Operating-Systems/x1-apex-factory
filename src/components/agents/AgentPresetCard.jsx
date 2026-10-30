import React from 'react';
import { Check, Download } from 'lucide-react';
import { categoryLabel } from '@/lib/agentPresets';

export default function AgentPresetCard({ preset, installed, busy, onInstall }) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-start gap-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-medium">
          {preset.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-medium">{preset.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {preset.role} · {categoryLabel(preset.category)}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border px-1.5 py-[1px] text-[10px] text-muted-foreground">
          {preset.tone}
        </span>
      </div>

      <p className="mt-2 max-h-[52px] overflow-hidden text-[11.5px] leading-relaxed text-muted-foreground">
        {preset.instructions}
      </p>

      <div className="mt-3 flex items-center gap-1.5">
        {installed ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
            <Check size={10} /> In your library
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onInstall(preset)}
            disabled={busy}
            className="glass-blue inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium disabled:opacity-60"
          >
            <Download size={10} /> {busy ? 'Adding…' : 'Add to library'}
          </button>
        )}
      </div>
    </div>
  );
}