import React from 'react';
import { Check, Plug } from 'lucide-react';
import { accessLabel } from '@/lib/connectorCatalog';

export default function ConnectorCard({ connector, record, onOpen }) {
  const installed = Boolean(record);

  return (
    <button
      type="button"
      onClick={() => onOpen(connector)}
      className="flex h-full flex-col rounded-xl border border-border bg-card p-3.5 text-left transition-colors hover:border-foreground/25"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-secondary">
            <Plug size={12} className="text-muted-foreground" />
          </span>
          <p className="truncate text-[12.5px] font-medium">{connector.name}</p>
        </div>
        {installed ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-foreground/20 px-1.5 py-[1px] text-[10px]">
            <Check size={9} /> On
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-border px-1.5 py-[1px] text-[10px] text-muted-foreground">
            {connector.category}
          </span>
        )}
      </div>

      <p className="mt-1.5 line-clamp-2 flex-1 text-[11px] leading-relaxed text-muted-foreground">
        {connector.description}
      </p>

      <p className="mt-2 text-[10px] text-muted-foreground">
        {installed ? `${accessLabel(record.access)} · ${record.auto_approve ? 'runs freely' : 'asks first'}` : `${connector.scopes.length} permissions`}
      </p>
    </button>
  );
}