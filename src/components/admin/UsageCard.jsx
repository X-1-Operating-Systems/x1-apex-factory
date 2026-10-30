import React from 'react';

/**
 * What the app's own host reports about itself. No proxy meter and no rented quota:
 * the host counts minutes, sessions and actions, and caps concurrency itself.
 */
export default function UsageCard({ data }) {
  const minutes = Number(data && data.browserMinutes) || 0;
  const opened = Number(data && data.sessions_opened) || 0;
  const running = Number(data && data.sessions_running) || 0;
  const actions = Number(data && data.actions) || 0;
  const maxSessions = Number(data && data.max_sessions) || 0;

  return (
    <div className="space-y-1.5 rounded-lg border border-border bg-card p-2.5">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-medium">Browser usage</p>
        <p className="font-mono text-[11px]">{minutes} min</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
        <span>{opened} sessions opened</span>
        <span>{running} running{maxSessions ? ` of ${maxSessions}` : ''}</span>
        <span>{actions} page actions</span>
      </div>
      <p className="text-[10px] text-muted-foreground">Counted by your host, not a vendor meter.</p>
    </div>
  );
}