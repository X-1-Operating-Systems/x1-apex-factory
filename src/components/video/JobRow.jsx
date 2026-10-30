import React, { useState } from 'react';
import moment from 'moment';
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { callVideo } from '@/lib/videoApi';

const TONE = {
  completed: 'text-emerald-600 bg-emerald-500/10',
  processing: 'text-amber-600 bg-amber-500/10',
  waiting: 'text-amber-600 bg-amber-500/10',
  pending: 'text-amber-600 bg-amber-500/10',
  submitted: 'text-muted-foreground bg-muted',
  failed: 'text-destructive bg-destructive/10',
};

export default function JobRow({ job, onRefreshed }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const tone = TONE[String(job.status || '').toLowerCase()] || TONE.submitted;
  const done = Boolean(job.video_url);

  const refresh = async () => {
    setBusy(true);
    setError(null);
    const result = await callVideo('heygen', 'videos.get', { video_id: job.job_id });
    setBusy(false);
    if (!result.ok) {
      setError(result.error || 'HeyGen did not answer.');
      return;
    }
    if (onRefreshed) onRefreshed();
  };

  return (
    <div className="border-b border-border/60 px-3.5 py-2.5 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-[2px] text-[10px] font-medium ${tone}`}>{job.status}</span>
        <span className="min-w-0 flex-1 truncate text-[12px]">{job.title || job.job_id}</span>
        <span className="text-[10px] text-muted-foreground">{moment(job.created_date).format('D MMM, HH:mm')}</span>
        {!done && (
          <button
            type="button"
            onClick={refresh}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-[2px] text-[10px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            {busy ? <Loader2 size={9} className="animate-spin" /> : <RefreshCw size={9} />} Status
          </button>
        )}
        {done && (
          <a
            href={job.video_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-[2px] text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink size={9} /> Open
          </a>
        )}
      </div>

      {done && (
        <video
          src={job.video_url}
          poster={job.thumbnail_url || undefined}
          controls
          className="mt-2 h-[150px] w-full rounded-md border border-border bg-black"
        />
      )}
      {job.error && <p className="mt-1 text-[10.5px] text-destructive">{job.error}</p>}
      {error && <p className="mt-1 text-[10.5px] text-destructive">{error}</p>}
    </div>
  );
}