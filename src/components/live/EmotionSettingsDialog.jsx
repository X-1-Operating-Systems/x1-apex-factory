import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import EmotionControl from '@/components/live/EmotionControl';
import { EMOTION_SECTIONS } from '@/lib/emotionSchema';

const CONTROL_COUNT = EMOTION_SECTIONS.reduce((total, section) => total + section.controls.length, 0);

// The whole surface of her mind, one row per setting. Save sends the draft to the backend, which
// clamps every value before it is stored, so what comes back is what she actually runs on.
export default function EmotionSettingsDialog({ open, onOpenChange, settings, defaults, onSave }) {
  const [draft, setDraft] = useState({});
  const [tab, setTab] = useState('generation');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setDraft({ ...(settings || {}) });
    setError(null);
  }, [open, settings]);

  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    const ok = await onSave(draft);
    setSaving(false);
    if (ok) onOpenChange(false);
    else setError('The settings were not saved.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] w-[calc(100vw-2rem)] max-w-[760px] flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="font-heading text-[15px] tracking-tight">Eden&apos;s mind — all settings</DialogTitle>
          <DialogDescription className="text-[11px] leading-relaxed">
            {CONTROL_COUNT} controls across generation, identity, emotional dynamics, memory, delivery and session.
            Every value is stored and applied on her next turn.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-border px-3 py-2">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
              {EMOTION_SECTIONS.map((section) => (
                <TabsTrigger
                  key={section.key}
                  value={section.key}
                  className="h-7 rounded-full border border-border px-2.5 text-[11px] font-normal text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none"
                >
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto scroll-thin px-4 py-3">
            {EMOTION_SECTIONS.map((section) => (
              <TabsContent key={section.key} value={section.key} className="mt-0 space-y-4">
                <p className="text-[11px] leading-relaxed text-muted-foreground">{section.blurb}</p>
                {section.controls.map((control) => (
                  <EmotionControl
                    key={control.key}
                    control={control}
                    value={draft[control.key]}
                    onChange={(value) => set(control.key, value)}
                  />
                ))}
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2.5">
          <button
            type="button"
            onClick={() => setDraft({ ...(defaults || {}) })}
            className="text-[11px] text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Load defaults
          </button>
          {error && <span className="text-[10.5px] text-destructive">{error}</span>}
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" className="rounded-full text-[12px]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" className="rounded-full text-[12px]" disabled={saving} onClick={save}>
              {saving && <Loader2 size={11} className="mr-1 animate-spin" />} Save settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}