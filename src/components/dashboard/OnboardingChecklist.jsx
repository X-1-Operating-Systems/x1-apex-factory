import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const KEY = 'x1.onboarding.hidden';

const STEPS = [
  { label: 'Run your first task', hint: 'Describe an outcome and let the agent build it.', to: '/new', entity: 'StudioTask' },
  { label: 'Install an agent', hint: 'A persona that works in your voice.', to: '/agents', entity: 'StudioAgent' },
  { label: 'Enable a skill', hint: 'Reusable instructions every run inherits.', to: '/skills', entity: 'StudioSkill' },
  { label: 'Schedule an automation', hint: 'Put recurring work on a clock.', to: '/automations', entity: 'Automation' },
  { label: 'Connect a tool', hint: 'Grant read or write access to a service.', to: '/plugins', entity: 'StudioConnector' },
  { label: 'Ship a release', hint: 'Audit, approve and deploy a site.', to: '/releases', entity: 'Deployment' },
];

export default function OnboardingChecklist() {
  const [done, setDone] = useState(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(localStorage.getItem(KEY) === '1');
  }, []);

  useEffect(() => {
    if (hidden) return;
    let live = true;
    Promise.all(STEPS.map((step) => base44.entities[step.entity].count())).then((counts) => {
      if (live) setDone(counts.map((n) => n > 0));
    });
    return () => {
      live = false;
    };
  }, [hidden]);

  const hide = () => {
    localStorage.setItem(KEY, '1');
    setHidden(true);
  };

  if (hidden || !done) return null;
  const complete = done.filter(Boolean).length;
  if (complete === STEPS.length) return null;

  return (
    <section className="mt-10 rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-[12.5px] font-medium">Get set up</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {complete} of {STEPS.length} done. Each step unlocks part of the studio.
          </p>
        </div>
        <button
          type="button"
          onClick={hide}
          aria-label="Hide setup checklist"
          className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X size={13} />
        </button>
      </div>

      <div className="px-4 pt-3">
        <div className="h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-foreground/80 transition-all"
            style={{ width: `${(complete / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <ul className="grid gap-x-4 px-4 py-3 sm:grid-cols-2">
        {STEPS.map((step, index) => {
          const isDone = done[index];
          return (
            <li key={step.to} className="border-b border-border/60 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0">
              <Link to={step.to} className="group flex items-start gap-2.5 py-2">
                <span
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[9px] ${
                    isDone ? 'border-foreground bg-foreground text-background' : 'border-border text-transparent'
                  }`}
                >
                  <Check size={9} strokeWidth={3} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[12px] ${isDone ? 'text-muted-foreground line-through' : 'font-medium'}`}>
                    {step.label}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted-foreground">{step.hint}</span>
                </span>
                {!isDone && (
                  <ArrowRight
                    size={12}
                    className="mt-1 shrink-0 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}