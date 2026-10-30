import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AlertCircle, FileDown, Wrench } from 'lucide-react';

const clock = (ts) => {
  if (!ts) return '';
  const value = Number(ts);
  const date = new Date(value > 1e12 ? value : value * 1000);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

function Files({ attachments }) {
  if (!attachments?.length) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {attachments.map((file, i) => (
        <a
          key={i}
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] text-foreground hover:bg-secondary"
        >
          <FileDown size={10} /> {file.name.slice(0, 32)}
        </a>
      ))}
    </div>
  );
}

export default function TaskEvent({ event }) {
  if (event.role === 'agent') {
    return (
      <div className="flex items-start gap-2 pl-1 text-[11.5px] text-muted-foreground">
        <Wrench size={11} className="mt-0.5 shrink-0" />
        <span className="min-w-0 break-words">{event.content}</span>
      </div>
    );
  }

  if (event.role === 'error') {
    return (
      <p className="flex items-start gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 p-2 text-[12px] text-destructive">
        <AlertCircle size={12} className="mt-0.5 shrink-0" /> {event.content}
      </p>
    );
  }

  if (event.role === 'system') {
    return <p className="py-0.5 text-center text-[11px] text-muted-foreground">{event.content}</p>;
  }

  const isUser = event.role === 'user';

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div
        className={`max-w-[94%] rounded-xl px-3 py-2 ${
          isUser ? 'bg-foreground text-background' : 'border border-border bg-card'
        }`}
      >
        <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wide opacity-60">
          {isUser ? 'You' : 'Studio'} · {clock(event.timestamp || event.ts)}
        </div>
        {isUser ? (
          <p className="whitespace-pre-line text-[12.5px] leading-relaxed">{event.content}</p>
        ) : (
          <div className="text-[12.5px] leading-relaxed [&_a]:underline [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1 [&_code]:text-[11.5px] [&_h1]:mb-1 [&_h1]:mt-2 [&_h1]:font-heading [&_h1]:text-[15px] [&_h2]:mb-1 [&_h2]:mt-2 [&_h2]:font-heading [&_h2]:text-[14px] [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-[12.5px] [&_h3]:font-medium [&_img]:my-1.5 [&_img]:max-w-full [&_img]:rounded-md [&_img]:border [&_img]:border-border [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-1.5 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-secondary [&_pre]:p-2 [&_strong]:font-medium">
            <ReactMarkdown>{event.content || ''}</ReactMarkdown>
          </div>
        )}
        <Files attachments={event.attachments} />
      </div>
    </div>
  );
}