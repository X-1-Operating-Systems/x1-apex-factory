import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ExternalLink, Globe, History, Loader2, Rocket } from 'lucide-react';
import { Image } from '@/components/ui/image';

const PUBLISH_TONE = {
  published: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  publishing: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  failed: 'bg-destructive/10 text-destructive border-destructive/30',
  unpublished: 'bg-secondary text-muted-foreground border-border',
};

export default function WebsiteCard({ site }) {
  const [state, setState] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const read = async () => {
    const res = await base44.functions.invoke('manusAgent', { action: 'website', task_id: site.task_id });
    setState(res.data);
    return res.data;
  };

  useEffect(() => {
    if (site.task_id) read().catch(() => {});
  }, [site.task_id]);

  const publish = async () => {
    setPublishing(true);
    try {
      await base44.functions.invoke('manusAgent', { action: 'publish', task_id: site.task_id });
      for (let i = 0; i < 4; i += 1) {
        const next = await read();
        if (next.publish_status === 'published' || next.publish_status === 'failed') break;
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    } finally {
      setPublishing(false);
    }
  };

  const tone = PUBLISH_TONE[state?.publish_status] || PUBLISH_TONE.unpublished;
  const liveUrl = state?.site_url || site.url;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative h-32 bg-secondary">
        {site.cover_image ? (
          <Image src={site.cover_image} alt={site.name} fittingType="fill" className="h-32 w-full" />
        ) : (
          <div className="grid h-32 place-items-center text-muted-foreground">
            <Globe size={18} />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/websites/${site.task_id}`} className="truncate text-[12.5px] font-medium hover:underline">
            {state?.title || site.name}
          </Link>
          <span className={`shrink-0 rounded-full border px-1.5 py-[1px] text-[10px] font-medium ${tone}`}>
            {state?.publish_status === 'published' ? 'Live' : state?.publish_status || 'Checking'}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">{site.task_title || 'Manus website'}</p>

        <div className="mt-2.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={publish}
            disabled={publishing || !site.task_id}
            className="flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] transition-colors hover:bg-secondary disabled:opacity-50"
          >
            {publishing ? <Loader2 size={10} className="animate-spin" /> : <Rocket size={10} />}
            {publishing ? 'Deploying' : 'Publish'}
          </button>
          <Link
            to={`/websites/${site.task_id}`}
            className="flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] transition-colors hover:bg-secondary"
          >
            <History size={10} /> Versions
          </Link>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] transition-colors hover:bg-secondary"
            >
              Open <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}