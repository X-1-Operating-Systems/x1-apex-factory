import React, { useMemo } from 'react';

const WEEKS = 6;

const startOfWeek = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
};

const ms = (value) => {
  const ts = Number(value);
  if (!ts) return 0;
  return ts > 1e12 ? ts : ts * 1000;
};

export default function VersionActivity({ checkpoints, publishedVersionId }) {
  const { buckets, total, latest } = useMemo(() => {
    const now = startOfWeek(new Date());
    const rows = Array.from({ length: WEEKS }, (_, index) => {
      const start = new Date(now);
      start.setDate(now.getDate() - (WEEKS - 1 - index) * 7);
      return { start, count: 0 };
    });

    let last = 0;
    for (const checkpoint of checkpoints || []) {
      const at = ms(checkpoint.created_at);
      if (!at) continue;
      last = Math.max(last, at);
      const week = startOfWeek(new Date(at)).getTime();
      const bucket = rows.find((row) => row.start.getTime() === week);
      if (bucket) bucket.count += 1;
    }

    return { buckets: rows, total: (checkpoints || []).length, latest: last };
  }, [checkpoints]);

  const peak = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const live = (checkpoints || []).find((checkpoint) => checkpoint.version_id === publishedVersionId);

  return (
    <section className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Build activity</p>
        <p className="text-[11px] text-muted-foreground">
          {total} version{total === 1 ? '' : 's'}
          {latest ? ` · last ${new Date(latest).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}
        </p>
      </div>

      <div className="mt-3 flex items-end gap-1.5">
        {buckets.map((bucket) => (
          <div key={bucket.start.toISOString()} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div
              title={`${bucket.count} version${bucket.count === 1 ? '' : 's'}`}
              className={`w-full rounded-sm ${bucket.count ? 'bg-foreground/70' : 'bg-secondary'}`}
              style={{ height: `${8 + (bucket.count / peak) * 44}px` }}
            />
            <span className="text-[9.5px] text-muted-foreground">
              {bucket.start.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">
        Versions saved per week from the site's checkpoints.
        {live ? ` Live: ${live.version_id}${live.message ? ` — ${live.message}` : ''}.` : ' No version is published yet.'}
      </p>
    </section>
  );
}