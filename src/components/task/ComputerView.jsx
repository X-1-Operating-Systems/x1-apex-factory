import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ExternalLink, Loader2 } from 'lucide-react';
import PageCanvas from '@/components/studio/PageCanvas';

const FALLBACK = { accent: '#b4532a', surface: 'light', headlineFont: 'serif' };

export default function ComputerView({ task, engine }) {
  const [url, setUrl] = useState('');
  const [page, setPage] = useState(null);
  const [tokens, setTokens] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!task?.id) return undefined;
    let live = true;
    setLoading(true);

    const load = async () => {
      if (engine === 'manus') {
        const res = await base44.functions.invoke('manusAgent', { action: 'website', task_id: task.id }).catch(() => null);
        if (!live) return;
        setUrl(res?.data?.preview_url || res?.data?.site_url || '');
        setPage(null);
        setLoading(false);
        return;
      }

      if (!task.project_id) {
        if (!live) return;
        setPage(null);
        setLoading(false);
        return;
      }

      const [pages, project] = await Promise.all([
        base44.entities.StudioPage.filter({ project_id: task.project_id }, { sort: 'created_date', limit: 1 }).catch(() => null),
        base44.entities.Project.get(task.project_id).catch(() => null),
      ]);
      if (!live) return;
      setUrl('');
      setPage(pages?.items?.[0] || null);
      setTokens(
        project
          ? {
              accent: project.accent || FALLBACK.accent,
              surface: project.surface || FALLBACK.surface,
              headlineFont: project.headline_font || FALLBACK.headlineFont,
            }
          : FALLBACK
      );
      setLoading(false);
    };

    load();
    return () => {
      live = false;
    };
  }, [task?.id, task?.project_id, task?.updated_date, engine]);

  if (loading) {
    return (
      <div className="grid h-[180px] place-items-center rounded-lg border border-border bg-card">
        <Loader2 size={13} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (url) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <iframe
          src={url}
          title={`Live view of ${task?.title || 'this build'}`}
          className="h-[240px] w-full bg-white"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-2 border-t border-border px-2.5 py-1.5 text-[10.5px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
          <ExternalLink size={10} className="shrink-0" />
        </a>
      </div>
    );
  }

  if (page) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center gap-1 border-b border-border px-2 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
          <span className="ml-1.5 truncate text-[10px] text-muted-foreground">{page.name} · v{page.version}</span>
        </div>
        <div className="max-h-[260px] overflow-y-auto scroll-thin">
          <PageCanvas blocks={page.blocks || []} tokens={tokens} showSelection={false} />
        </div>
      </div>
    );
  }

  return (
    <p className="rounded-lg border border-dashed border-border px-2.5 py-3 text-[11.5px] leading-relaxed text-muted-foreground">
      This run has no viewable surface yet. The page appears here as soon as the studio composes one.
    </p>
  );
}