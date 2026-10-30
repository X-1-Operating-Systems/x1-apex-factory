import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import PageCanvas from '@/components/studio/PageCanvas';

export default function TemplateCard({ template, onUse, onPreview }) {
  const tokens = {
    accent: template.accent || '#b4532a',
    surface: template.surface || 'light',
    headlineFont: template.headline_font || 'serif',
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/25">
      <button
        type="button"
        onClick={() => onPreview(template)}
        aria-label={`Preview ${template.name}`}
        className="block h-[168px] w-full cursor-zoom-in overflow-hidden border-b border-border"
      >
        <div className="pointer-events-none h-full">
          <PageCanvas blocks={template.blocks || []} tokens={tokens} showSelection={false} />
        </div>
      </button>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{template.category?.replace('_', ' ')}</p>
          <h3 className="mt-1 truncate text-[15px] font-medium tracking-tight">{template.name}</h3>
          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">{template.tagline}</p>
        </div>
        <button
          type="button"
          onClick={() => onUse(template)}
          className="glass-blue mt-1 flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold"
        >
          Use <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}