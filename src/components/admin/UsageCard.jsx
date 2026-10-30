import React from 'react';

export default function UsageCard({ data }) {
  const minutes = Number(data && data.browserMinutes) || 0;
  const proxyBytes = Number(data && data.proxyBytes) || 0;
  const percent = Math.min(100, Math.round((minutes / 600) * 100));

  return (
    <div className="space-y-1.5 rounded-lg border border-border bg-card p-2.5">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-medium">Browser usage</p>
        <p className="font-mono text-[11px]">{minutes} min</p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-foreground" style={{ width: `${percent}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Proxy {proxyBytes.toLocaleString()} bytes</span>
        <span>{percent}% of the 600 min review line</span>
      </div>
    </div>
  );
}