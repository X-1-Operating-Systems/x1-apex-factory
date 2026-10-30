import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageCanvas from '@/components/studio/PageCanvas';

export default function TemplatePreviewDialog({ template, open, onOpenChange, onUse }) {
  if (!template) return null;

  const tokens = {
    accent: template.accent || '#b4532a',
    surface: template.surface || 'light',
    headlineFont: template.headline_font || 'serif',
  };

  const sections = (template.blocks || []).map((block) => block.type.replace(/_/g, ' '));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-3">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-medium">{template.name}</DialogTitle>
        </DialogHeader>

        <p className="-mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{template.tagline}</p>

        <div className="pointer-events-none h-[380px] overflow-hidden rounded-lg border border-border">
          <PageCanvas blocks={template.blocks || []} tokens={tokens} showSelection={false} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Sections</p>
            <p className="mt-1 text-[11.5px] capitalize text-muted-foreground">{sections.join(' · ')}</p>
          </div>
          <button
            type="button"
            onClick={() => onUse(template)}
            className="glass-blue inline-flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-[11.5px] font-medium"
          >
            Use template <ArrowUpRight size={12} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}