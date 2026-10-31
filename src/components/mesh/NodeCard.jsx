import React from 'react';
import { ArrowDownLeft, ArrowUpRight, CircleAlert, CircleCheck } from 'lucide-react';

const KIND_LABEL = {
  host: 'This app',
  client: 'AI client',
  infra: 'Infrastructure',
  data: 'Database',
  os: 'Operating system',
  local: 'Local machine',
};

export default function NodeCard({ node }) {
  const Icon = node.ok ? CircleCheck : CircleAlert;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-[12.5px] font-medium">
            <Icon size={13} className={node.ok ? 'text-foreground' : 'text-destructive'} />
            {node.label}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            {KIND_LABEL[node.kind] || node.kind}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
          {node.ms ? `${node.ms} ms` : node.status ? `${node.status}` : '—'}
        </span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {node.inbound && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[9.5px] text-muted-foreground">
            <ArrowDownLeft size={9} /> calls in
          </span>
        )}
        {node.outbound && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[9.5px] text-muted-foreground">
            <ArrowUpRight size={9} /> we call out
          </span>
        )}
      </div>

      <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
        {node.detail || (node.needs ? `Set ${node.needs} to arm this node.` : 'No answer yet.')}
      </p>
    </div>
  );
}