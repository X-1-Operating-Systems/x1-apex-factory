import React from 'react';
import moment from 'moment';
import SessionTranscript from '@/components/live/SessionTranscript';

const TONE = {
  started: 'text-emerald-600 bg-emerald-500/10',
  ended: 'text-muted-foreground bg-muted',
};

export default function SessionHistory({ sessions = [] }) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="border-b border-border px-3.5 py-2.5">
        <h2 className="font-heading text-[13px] tracking-tight">Sessions</h2>
        <p className="text-[10.5px] text-muted-foreground">{sessions.length} stored on this workspace</p>
      </header>
      {sessions.length ? (
        <div className="divide-y divide-border/60">
          {sessions.map((session) => (
            <div key={session.id} className="flex flex-wrap items-center gap-2 px-3.5 py-2">
              <span className={`rounded-full px-2 py-[2px] text-[10px] font-medium ${TONE[session.status] || TONE.ended}`}>
                {session.status}
              </span>
              <span className="min-w-0 flex-1 truncate font-mono text-[10.5px]">{session.session_id}</span>
              <span className="text-[10px] text-muted-foreground">{session.mode}</span>
              <span className="text-[10px] text-muted-foreground">
                {moment(session.started_at || session.created_date).format('D MMM, HH:mm')}
              </span>
              {session.status === 'ended' && <SessionTranscript session={session} />}
            </div>
          ))}
        </div>
      ) : (
        <p className="px-3.5 py-4 text-[11px] leading-relaxed text-muted-foreground">
          No sessions yet. Start a sandbox session above — it costs nothing and proves the whole path.
        </p>
      )}
    </section>
  );
}