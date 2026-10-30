import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { Image } from '@/components/ui/image';

const stamp = (value) => {
  if (!value) return '';
  const ts = Number(value);
  if (!ts) return '';
  return new Date(ts > 1e12 ? ts : ts * 1000).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function VersionList({ checkpoints, publishedVersionId, onRollback, rollingBackId }) {
  if (!checkpoints?.length) {
    return <p className="text-[11.5px] text-muted-foreground">No versions yet. Ask the agent to build the site.</p>;
  }

  return (
    <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {checkpoints.map((checkpoint) => {
        const live = checkpoint.version_id === publishedVersionId;
        return (
          <li key={checkpoint.version_id} className="flex items-start gap-2.5 p-2.5">
            {checkpoint.screenshot_url ? (
              <Image
                src={checkpoint.screenshot_url}
                alt=""
                fittingType="fill"
                className="h-10 w-16 shrink-0 rounded border border-border"
              />
            ) : (
              <div className="grid h-10 w-16 shrink-0 place-items-center rounded border border-border bg-secondary text-muted-foreground">
                <Clock size={11} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[12px] font-medium">{checkpoint.message || 'Checkpoint'}</span>
                {live && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-[1px] text-[10px] font-medium text-emerald-600">
                    <CheckCircle2 size={9} /> Live
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                {checkpoint.version_id}
                {checkpoint.created_at ? ` · ${stamp(checkpoint.created_at)}` : ''}
                {checkpoint.status ? ` · ${checkpoint.status}` : ''}
              </p>
            </div>
            {onRollback && !live && (
              <button
                type="button"
                onClick={() => onRollback(checkpoint)}
                disabled={rollingBackId === checkpoint.version_id}
                className="shrink-0 self-center rounded-full border border-border px-2 py-[3px] text-[10.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
              >
                {rollingBackId === checkpoint.version_id ? 'Sending' : 'Roll back'}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}