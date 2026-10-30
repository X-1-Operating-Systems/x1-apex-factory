import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Check, AlertTriangle, XCircle } from 'lucide-react';

const ICONS = { pass: Check, warn: AlertTriangle, fail: XCircle };
const TONES = { pass: 'text-emerald-600', warn: 'text-amber-600', fail: 'text-destructive' };

export default function QaPanel({ open, onOpenChange, run }) {
  const checks = run?.checks || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="display-title text-xl">Release review</DialogTitle>
          <DialogDescription>
            Validator, QA and Guardian run together against the current page version.
          </DialogDescription>
        </DialogHeader>

        {!run && <p className="text-sm text-muted-foreground">Run a review to see the gate results.</p>}

        {run && (
          <div className="space-y-4">
            <div className="flex items-end justify-between border-b border-border pb-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Verdict</p>
                <p className={`display-title text-2xl capitalize ${run.verdict === 'pass' ? 'text-emerald-600' : run.verdict === 'block' ? 'text-destructive' : 'text-amber-600'}`}>
                  {run.verdict === 'pass' ? 'Ready for approval' : run.verdict === 'block' ? 'Blocked' : 'Needs review'}
                </p>
              </div>
              <div className="text-right">
                <p className="display-title text-3xl">{Math.round(run.score)}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Score</p>
              </div>
            </div>

            <div className="max-h-[46vh] space-y-1.5 overflow-y-auto scroll-thin pr-1">
              {checks.map((c) => {
                const Icon = ICONS[c.status] || AlertTriangle;
                return (
                  <div key={c.id} className="flex items-start gap-2.5 rounded-lg border border-border px-3 py-2">
                    <Icon size={14} className={`mt-0.5 shrink-0 ${TONES[c.status]}`} />
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium">
                        {c.label}
                        <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{c.role}</span>
                      </p>
                      <p className="text-[11.5px] text-muted-foreground">{c.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {run.findings?.length > 0 && (
              <div className="rounded-lg bg-accent px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Next actions</p>
                <ul className="mt-1 space-y-1">
                  {run.findings.map((f, i) => (
                    <li key={i} className="text-[11.5px] text-foreground">· {f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}