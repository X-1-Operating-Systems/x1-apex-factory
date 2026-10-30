import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText } from 'lucide-react';

export default function DeliverableNote({ deliverable }) {
  if (!deliverable?.detail) return null;

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-1.5 border-b border-border px-3.5 py-2">
        <FileText size={12} className="text-muted-foreground" />
        <p className="min-w-0 flex-1 truncate text-[12px] font-medium">{deliverable.name}</p>
        <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">{deliverable.type}</span>
      </div>
      <div className="px-3.5 py-3 text-[12.5px] leading-relaxed text-foreground [&_a]:underline [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1 [&_code]:text-[11.5px] [&_h1]:mb-1 [&_h1]:mt-2 [&_h1]:font-heading [&_h1]:text-[15px] [&_h2]:mb-1 [&_h2]:mt-2 [&_h2]:font-heading [&_h2]:text-[14px] [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-[12.5px] [&_h3]:font-medium [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-1.5 [&_strong]:font-medium">
        <ReactMarkdown>{deliverable.detail}</ReactMarkdown>
      </div>
    </div>
  );
}