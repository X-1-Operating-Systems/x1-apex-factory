import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Globe, Loader2, Monitor, X } from 'lucide-react';
import ComputerActions from '@/components/task/ComputerActions';
import ComputerFeed from '@/components/task/ComputerFeed';
import ComputerPlan from '@/components/task/ComputerPlan';
import ComputerView from '@/components/task/ComputerView';
import { effortLabel, modelLabel } from '@/lib/taskOptions';

const LABEL = 'mb-1.5 text-[10.5px] uppercase tracking-wide text-muted-foreground';

export default function ComputerPane({ task, events = [], run, engine, onClose }) {
  const [browsers, setBrowsers] = useState(null);
  const running = task?.status === 'running' || task?.status === 'waiting';

  useEffect(() => {
    if (engine !== 'manus') return undefined;
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
  }, [engine, task?.id, running]);

  const now =
    run?.waiting ||
    run?.brief ||
    (running ? `Working the ${effortLabel(task?.effort)} pass with ${modelLabel(task?.model)}.` : '') ||
    task?.summary ||
    'No live activity.';

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex h-[46px] shrink-0 items-center justify-between border-b border-border px-3.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <Monitor size={13} strokeWidth={1.8} className="shrink-0" />
          <p className="truncate text-[12.5px] font-medium">Computer</p>
          <span className="shrink-0 rounded-full border border-border px-1.5 py-[1px] text-[10px] capitalize text-muted-foreground">
            {engine === 'manus' ? 'Manus' : 'Native'}
          </span>
          {running && <span className="h-1 w-1 shrink-0 animate-pulse rounded-full bg-info" />}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close computer panel"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto scroll-thin p-3.5">
        <section>
          <p className={LABEL}>Live view</p>
          <ComputerView task={task} engine={engine} />
        </section>

        <section>
          <p className={LABEL}>Now</p>
          <p className="text-[12px] leading-relaxed">{now}</p>
          {engine === 'native' && (
            <p className="mt-1 text-[10.5px] text-muted-foreground">
              {modelLabel(task?.model)} · {effortLabel(task?.effort)}
            </p>
          )}
          {run?.agent_status && <p className="mt-1 text-[10.5px] capitalize text-muted-foreground">{run.agent_status}</p>}
        </section>

        <ComputerPlan steps={run?.steps || []} />

        <section>
          <p className={LABEL}>{engine === 'manus' ? 'Actions' : 'Live feed'}</p>
          {engine === 'manus' ? (
            <ComputerActions actions={run?.activity || []} />
          ) : (
            <ComputerFeed events={events} />
          )}
        </section>

        {engine === 'manus' && (
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
        )}
      </div>
    </div>
  );
}