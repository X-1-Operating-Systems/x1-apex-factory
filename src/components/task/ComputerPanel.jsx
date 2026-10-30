import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Globe, Loader2, Monitor, X } from 'lucide-react';
import ComputerActions from '@/components/task/ComputerActions';
import ComputerPlan from '@/components/task/ComputerPlan';

const LABEL = 'mb-1.5 text-[10.5px] uppercase tracking-wide text-muted-foreground';

export default function ComputerPanel({ run, open, onClose }) {
  const [browsers, setBrowsers] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    let live = true;
    base44.functions
      .invoke('manusAgent', { action: 'browsers' })
      .then((res) => {
        if (live) setBrowsers(res.data?.browsers || []);
      })
      .catch(() => {
        if (live) setBrowsers([]);
      });
    return () => {
      live = false;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-30 bg-foreground/10" onClick={onClose} aria-hidden="true" />
      <aside className="fixed inset-y-0 right-0 z-40 flex w-[340px] max-w-[92vw] flex-col border-l border-border bg-background">
        <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-border px-4">
          <p className="flex items-center gap-1.5 text-[12.5px] font-medium">
            <Monitor size={13} strokeWidth={1.8} /> Computer
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close computer panel"
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto scroll-thin p-4">
          <section>
            <p className={LABEL}>Now</p>
            <p className="text-[12.5px] leading-relaxed">
              {run?.waiting || run?.brief || run?.description || 'No live activity.'}
            </p>
            {run?.agent_status && (
              <p className="mt-1 text-[10.5px] capitalize text-muted-foreground">{run.agent_status}</p>
            )}
          </section>

          <section>
            <p className={LABEL}>Online computers</p>
            {browsers === null ? (
              <Loader2 size={12} className="animate-spin text-muted-foreground" />
            ) : browsers.length === 0 ? (
              <p className="text-[11.5px] text-muted-foreground">No browser is connected right now.</p>
            ) : (
              <ul className="space-y-1">
                {browsers.map((browser) => (
                  <li key={browser.id} className="flex items-center gap-1.5 text-[11.5px]">
                    <Globe size={10} className="shrink-0 text-emerald-600" />
                    <span className="truncate">{browser.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <ComputerPlan steps={run?.steps || []} />
          <ComputerActions actions={run?.activity || []} />
        </div>
      </aside>
    </>
  );
}