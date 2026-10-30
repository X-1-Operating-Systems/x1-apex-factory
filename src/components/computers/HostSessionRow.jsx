import React from 'react';
import moment from 'moment';
import { Monitor } from 'lucide-react';
import LiveFrame from '@/components/admin/LiveFrame';

export default function HostSessionRow({ session, canViewLive }) {
  const running = String(session.status || '').toUpperCase() === 'RUNNING';
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-secondary">
          <Monitor size={13} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-mono text-[10.5px]">{session.session_id}</p>
          <p className="truncate text-[10.5px] text-muted-foreground">
            {moment(session.started_at || session.created_date).fromNow()}
            {session.note ? ` · ${session.note}` : ''}
          </p>
        </div>
        <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-1.5 py-[1px] text-[10px] text-muted-foreground">
          {running && <span className="h-1 w-1 rounded-full bg-emerald-500" />}
          {running ? 'running' : String(session.status || 'closed').toLowerCase()}
        </span>
      </div>
      {running && canViewLive && (
        <div className="mt-2">
          <LiveFrame sessionId={session.session_id} heightClass="h-[180px]" />
        </div>
      )}
      {running && !canViewLive && (
        <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">
          Live view is limited to workspace admins. The session itself is running on your host.
        </p>
      )}
    </div>
  );
}