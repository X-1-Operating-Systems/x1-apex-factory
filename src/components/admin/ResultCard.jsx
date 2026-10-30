import React from 'react';
import SessionCard from './SessionCard';
import RunCard from './RunCard';
import TranscriptCard from './TranscriptCard';
import UsageCard from './UsageCard';

function GenericCard({ action, data }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5">
      <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{action}</p>
      <pre className="mt-1 max-h-[170px] overflow-auto scroll-thin whitespace-pre-wrap break-words font-mono text-[10px] leading-relaxed">
        {data === null || data === undefined ? 'No content returned' : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default function ResultCard({ action, result }) {
  if (!result || result.needs_confirmation) return null;

  if (!result.ok) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-2.5">
        <p className="text-[10px] uppercase tracking-[0.08em] text-destructive">Failed · {action}</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-destructive">{result.error || 'unknown error'}</p>
        {result.path && <p className="mt-1 font-mono text-[10px] text-muted-foreground">{result.method} {result.path}</p>}
      </div>
    );
  }

  const data = result.data;

  // payload-shaped answers: print what came back instead of the session/run frame
  if (action === 'runs.messages') return <TranscriptCard data={data} />;
  if (
    action === 'runs.files' ||
    action === 'sessions.logs' ||
    action === 'sessions.downloads' ||
    action === 'sessions.list'
  ) {
    return <GenericCard action={action} data={data} />;
  }
  if (action.startsWith('sessions.')) return <SessionCard action={action} data={data} />;
  if (action.startsWith('runs.')) return <RunCard action={action} data={data} />;
  if (action === 'usage.get') return <UsageCard data={data} />;
  return <GenericCard action={action} data={data} />;
}