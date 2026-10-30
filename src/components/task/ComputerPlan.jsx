import React from 'react';
import { CheckCircle2, CircleDot, Loader2, XCircle } from 'lucide-react';

const ICONS = {
  done: [CheckCircle2, 'text-emerald-600'],
  doing: [Loader2, 'animate-spin text-info'],
  failed: [XCircle, 'text-destructive'],
  todo: [CircleDot, 'text-muted-foreground/50'],
};

export default function ComputerPlan({ steps }) {
  if (!steps?.length) return null;

  return (
    <section>
      <p className="mb-1.5 text-[10.5px] uppercase tracking-wide text-muted-foreground">Plan</p>
      <ol className="space-y-1.5">
        {steps.map((step, i) => {
          const [Icon, tone] = ICONS[step.status] || ICONS.todo;
          return (
            <li key={`${step.title}-${i}`} className="flex items-start gap-1.5 text-[11.5px] leading-snug">
              <Icon size={11} className={`mt-[2px] shrink-0 ${tone}`} />
              <span className={step.status === 'done' ? 'text-muted-foreground' : ''}>{step.title}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}