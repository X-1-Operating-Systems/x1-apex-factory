import React from 'react';
import { Check, X, CircleDashed } from 'lucide-react';

const AREA_LABEL = {
  keys: 'Keys',
  providers: 'Providers',
  connectors: 'Connectors',
  platform: 'Platform',
  live: 'Live output',
  loop: 'Autonomous loop',
};

export default function ProbeGrid({ catalog, run }) {
  const observed = new Map((run?.observations || []).map((item) => [item.probe_id, item]));
  const areas = [...new Set((catalog || []).map((probe) => probe.area))];

  if (!catalog?.length) {
    return <p className="text-[11.5px] text-muted-foreground">Loading probes…</p>;
  }

  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex items-baseline justify-between border-b border-border px-3.5 py-2.5">
        <h2 className="font-heading text-[13px] tracking-tight">What is installed, proven</h2>
        <span className="text-[10.5px] text-muted-foreground">{catalog.length} probes · every one a real call</span>
      </header>

      <div className="divide-y divide-border">
        {areas.map((area) => {
          const probes = catalog.filter((probe) => probe.area === area);
          const passed = probes.filter((probe) => observed.get(probe.id)?.passed).length;
          return (
            <div key={area} className="px-3.5 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.09em] text-muted-foreground">
                {AREA_LABEL[area] || area} · {passed}/{probes.length}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {probes.map((probe) => {
                  const result = observed.get(probe.id);
                  const state = !result ? 'unknown' : result.passed ? 'pass' : 'fail';
                  return (
                    <li key={probe.id} className="flex items-start gap-2">
                      <span className="mt-[2px] shrink-0">
                        {state === 'pass' && <Check size={12} className="text-emerald-600 dark:text-emerald-400" />}
                        {state === 'fail' && <X size={12} className="text-destructive" />}
                        {state === 'unknown' && <CircleDashed size={12} className="text-muted-foreground" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] leading-tight">{probe.label}</p>
                        <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                          {result ? result.detail : 'Not run yet'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}