import React from 'react';
import { Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CommandBox({ value, onChange, onRun, busy }) {
  return (
    <section className="rounded-lg border border-border bg-card px-3.5 py-3">
      <h2 className="font-heading text-[13px] tracking-tight">One command, built and shipped</h2>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        Plan, pages, copy, ceiling validation, release and a real browser check all run on their own. Put the
        command in and walk away.
      </p>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        placeholder="Build a site for … with a home page, services and a contact route. Copy should sound like …"
        className="mt-2 w-full resize-y rounded-md border border-input bg-background px-2.5 py-2 text-[12px] leading-relaxed outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" className="rounded-full" disabled={busy || value.trim().length < 8} onClick={onRun}>
          {busy ? <Loader2 size={11} className="mr-1 animate-spin" /> : <Play size={11} className="mr-1" />}
          {busy ? 'Starting' : 'Run it'}
        </Button>
        <span className="text-[10px] text-muted-foreground">Runs on GPT Sol · admin only</span>
      </div>
    </section>
  );
}