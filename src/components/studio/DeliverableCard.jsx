import React from 'react';
import { CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DeliverableCard({ page, project, onOpenCanvas, onReview, qaBusy }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <FileText size={13} className="shrink-0 text-muted-foreground" />
          <p className="truncate text-[12.5px] font-medium">{page.name}</p>
          <span className="shrink-0 rounded-full bg-secondary px-1.5 py-[1px] text-[10px] text-muted-foreground">v{page.version}</span>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-[10.5px] text-emerald-600">
          <CheckCircle2 size={12} /> Ready
        </span>
      </div>

      <div className="px-4 pt-3">
        <p className="display-title text-[19px] leading-tight">{page.seo_title || page.name}</p>
        <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">
          {page.seo_description || project.description || 'No description yet.'}
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {page.blocks?.length || 0} sections · {project.client_name || 'No client'} · {project.surface === 'dark' ? 'dark' : 'light'} surface
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <Button size="sm" className="h-8 px-3" onClick={onOpenCanvas}>
          Open canvas
        </Button>
        <button
          type="button"
          onClick={onReview}
          disabled={qaBusy}
          className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[12px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
        >
          <ShieldCheck size={12} /> {qaBusy ? 'Reviewing…' : 'Run review'}
        </button>
      </div>
    </div>
  );
}