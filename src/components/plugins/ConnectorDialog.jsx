import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ACCESS_LEVELS } from '@/lib/connectorCatalog';

export default function ConnectorDialog({ connector, record, open, onOpenChange, onConnect, onDisconnect, onUpdate, busy }) {
  if (!connector) return null;
  const installed = Boolean(record);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-medium">{connector.name}</DialogTitle>
        </DialogHeader>

        <p className="text-[11.5px] leading-relaxed text-muted-foreground">{connector.description}</p>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">What agents can reach</p>
          <ul className="mt-1.5 space-y-1">
            {connector.scopes.map((scope) => (
              <li key={scope} className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                <ShieldCheck size={11} /> {scope}
              </li>
            ))}
          </ul>
        </div>

        {installed && (
          <div className="space-y-3 rounded-lg border border-border px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11.5px] font-medium">Access level</p>
                <p className="text-[10.5px] text-muted-foreground">Limits what a run may change.</p>
              </div>
              <select
                value={record.access || 'read_write'}
                onChange={(e) => onUpdate(record, { access: e.target.value })}
                disabled={busy}
                className="h-8 rounded-md border border-input bg-transparent px-2 text-[11.5px] outline-none focus:border-foreground disabled:opacity-50"
              >
                {ACCESS_LEVELS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11.5px] font-medium">Run without asking</p>
                <p className="text-[10.5px] text-muted-foreground">
                  {record.auto_approve ? 'Agents may use this tool freely.' : 'Agents ask before each use.'}
                </p>
              </div>
              <Switch
                checked={Boolean(record.auto_approve)}
                onCheckedChange={(checked) => onUpdate(record, { auto_approve: checked })}
                disabled={busy}
                aria-label="Allow agents to use this connector without approval"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <p className="text-[10.5px] text-muted-foreground">
            {installed ? 'Installed in this workspace' : 'Not installed yet'}
          </p>
          {installed ? (
            <button
              type="button"
              onClick={() => onDisconnect(record)}
              disabled={busy}
              className="rounded-full border border-border px-3 py-1 text-[11.5px] text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onConnect(connector)}
              disabled={busy}
              className="glass-blue flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] font-medium disabled:opacity-50"
            >
              {busy && <Loader2 size={11} className="animate-spin" />}
              {busy ? 'Connecting' : 'Connect'}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}