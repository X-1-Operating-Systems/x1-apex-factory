import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const BLANK = { name: '', role: '', instructions: '', task_title: '' };

export default function AgentFormDialog({ open, onOpenChange, agent, onSubmit, busy }) {
  const [form, setForm] = useState(BLANK);

  useEffect(() => {
    if (open) setForm(agent ? { ...BLANK, ...agent } : BLANK);
  }, [open, agent]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const valid = form.name.trim() && form.instructions.trim();

  const submit = () => {
    if (!valid) return;
    onSubmit({
      name: form.name.trim(),
      role: form.role.trim(),
      instructions: form.instructions.trim(),
      task_title: form.task_title.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-medium">{agent ? 'Edit agent' : 'New agent'}</DialogTitle>
          <DialogDescription>
            Standing instructions are prepended to every assignment, so the agent keeps its voice and rules across runs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
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
            <Label className="text-[11.5px]">Standing instructions</Label>
            <Textarea
              value={form.instructions}
              onChange={set('instructions')}
              rows={5}
              placeholder="Build single-page sites with a serif headline, a clear above-the-fold promise, and one primary call to action. Always ship a mobile view."
              className="mt-1 text-[12.5px]"
            />
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

          <Button className="w-full" onClick={submit} disabled={!valid || busy}>
            {busy ? 'Saving…' : agent ? 'Save agent' : 'Create agent'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}