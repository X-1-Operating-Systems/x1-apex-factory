import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SKILL_CATEGORIES } from '@/lib/skills';

const BLANK = { name: '', description: '', instructions: '', category: 'craft' };

export default function SkillFormDialog({ open, onOpenChange, skill, onSubmit, busy }) {
  const [form, setForm] = useState(BLANK);

  useEffect(() => {
    if (open) setForm(skill ? { ...BLANK, ...skill } : BLANK);
  }, [open, skill]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const valid = form.name.trim() && form.instructions.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-medium">{skill ? 'Edit skill' : 'New skill'}</DialogTitle>
          <DialogDescription>
            An enabled skill is added to every task the studio runs, next to your personalization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-[11.5px]">Name</Label>
            <Input value={form.name} onChange={set('name')} placeholder="Mobile-first layouts" className="mt-1" />
          </div>

          <div>
            <Label className="text-[11.5px]">Category</Label>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {SKILL_CATEGORIES.map((item) => (
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
            <Label className="text-[11.5px]">Short description</Label>
            <Input
              value={form.description}
              onChange={set('description')}
              placeholder="Assume a phone first, then widen."
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-[11.5px]">Instructions</Label>
            <Textarea
              value={form.instructions}
              onChange={set('instructions')}
              rows={5}
              placeholder="Design every page for a 390px phone first. Stack sections, one idea per screen, no horizontal scroll."
              className="mt-1 text-[12.5px]"
            />
          </div>

          <Button
            className="w-full"
            disabled={!valid || busy}
            onClick={() =>
              onSubmit({
                name: form.name.trim(),
                description: form.description.trim(),
                instructions: form.instructions.trim(),
                category: form.category,
                enabled: skill ? Boolean(skill.enabled) : true,
              })
            }
          >
            {busy ? 'Saving…' : skill ? 'Save skill' : 'Create skill'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}