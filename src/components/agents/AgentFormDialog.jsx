import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AGENT_CATEGORIES, AGENT_TONES, categoryLabel } from '@/lib/agentPresets';

const BLANK = { name: '', role: '', instructions: '', task_title: '', category: 'website', tone: 'Direct' };

const GUARDRAILS = [
  'Never invent statistics or names. Mark anything unverified as an assumption.',
  'Write finished copy, never placeholders like "insert headline here".',
  'End every output with the single next action the operator should take.',
];

export default function AgentFormDialog({ open, onOpenChange, agent, onSubmit, busy }) {
  const [form, setForm] = useState(BLANK);

  useEffect(() => {
    if (open) setForm(agent ? { ...BLANK, ...agent } : BLANK);
  }, [open, agent]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const valid = form.name.trim() && form.instructions.trim();

  const addGuardrail = (line) =>
    setForm((prev) => ({
      ...prev,
      instructions: prev.instructions.trim() ? `${prev.instructions.trim()}\n- ${line}` : `- ${line}`,
    }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-medium">{agent ? 'Edit persona' : 'New persona'}</DialogTitle>
          <DialogDescription>
            Standing instructions ride along with every assignment, so the agent keeps its voice, rules and standard
            of proof across runs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5">
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/60 px-3 py-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card text-[11.5px] font-medium">
              {(form.name || 'NA').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium">{form.name || 'Unnamed persona'}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {form.role || 'Studio agent'} · {categoryLabel(form.category)}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-border px-1.5 py-[1px] text-[10px] text-muted-foreground">
              {form.tone}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-[11.5px]">Name</Label>
              <Input value={form.name} onChange={set('name')} placeholder="Landing page builder" className="mt-1" />
            </div>
            <div>
              <Label className="text-[11.5px]">Role</Label>
              <Input value={form.role} onChange={set('role')} placeholder="Senior web designer" className="mt-1" />
            </div>
          </div>

          <div>
            <Label className="text-[11.5px]">Specialty</Label>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {AGENT_CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, category: item.id }))}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                    form.category === item.id
                      ? 'border-foreground/20 bg-secondary text-foreground'
                      : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-[11.5px]">Tone</Label>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {AGENT_TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, tone }))}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                    form.tone === tone
                      ? 'border-foreground/20 bg-secondary text-foreground'
                      : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-[11.5px]">Standing instructions</Label>
            <Textarea
              value={form.instructions}
              onChange={set('instructions')}
              rows={6}
              placeholder="Build single-page sites with a serif headline, a clear above-the-fold promise, and one primary call to action. Always ship a mobile view."
              className="mt-1 text-[12.5px]"
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {GUARDRAILS.map((line) => (
                <button
                  key={line}
                  type="button"
                  onClick={() => addGuardrail(line)}
                  className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  + {line.split('.')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-[11.5px]">Default task title</Label>
            <Input
              value={form.task_title}
              onChange={set('task_title')}
              placeholder="Optional — a fixed title for every run"
              className="mt-1"
            />
          </div>

          <Button className="w-full" onClick={() => onSubmit({
            name: form.name.trim(),
            role: form.role.trim(),
            instructions: form.instructions.trim(),
            task_title: form.task_title.trim(),
            category: form.category,
            tone: form.tone,
          })} disabled={!valid || busy}>
            {busy ? 'Saving…' : agent ? 'Save persona' : 'Create persona'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}