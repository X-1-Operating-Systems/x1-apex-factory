import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { loadPreferences, savePreferences } from '@/lib/preferences';

export default function PersonalizationPanel() {
  const { toast } = useToast();
  const [record, setRecord] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [memory, setMemory] = useState([]);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences().then(({ record: saved, prefs }) => {
      setRecord(saved);
      setInstructions(prefs.personal_instructions || '');
      setMemory(Array.isArray(saved?.memory) ? saved.memory : []);
    });
  }, []);

  const persist = async (patch, message) => {
    setSaving(true);
    try {
      const next = { ...instructions ? { personal_instructions: instructions } : {}, ...patch };
      const { record: saved } = await savePreferences(next);
      setRecord(saved);
      if (message) toast({ title: message });
    } catch (err) {
      toast({ title: 'Could not save personalization', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addFact = async () => {
    const text = draft.trim();
    if (!text) return;
    const next = [...memory, { id: `${Date.now()}`, text }];
    setMemory(next);
    setDraft('');
    await persist({ memory: next }, 'Remembered');
  };

  const removeFact = async (id) => {
    const next = memory.filter((item) => item.id !== id);
    setMemory(next);
    await persist({ memory: next });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[12.5px] font-medium">Personalization</p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
        Standing context for every run: how you want the studio to work, and the facts it should never ask for again.
      </p>

      <div className="mt-3">
        <Label className="text-[11.5px]">How the studio should work with you</Label>
        <Textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          onBlur={() => persist({ personal_instructions: instructions }, 'Saved')}
          rows={4}
          placeholder="Always price in USD, never send anything before I approve, and write for a US small-business owner."
          className="mt-1 text-[12.5px]"
        />
        <p className="mt-1 text-[10.5px] text-muted-foreground">
          {saving ? 'Saving…' : 'Saved automatically when you leave the field.'}
          {!record ? ' Stored on first save.' : ''}
        </p>
      </div>

      <div className="mt-4">
        <Label className="text-[11.5px]">Remembered facts</Label>
        <form
          className="mt-1.5 flex gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            addFact();
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="My agency is two people, based in Boston"
            className="h-8 text-[12px]"
          />
          <button
            type="submit"
            disabled={!draft.trim() || saving}
            aria-label="Remember this fact"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <Plus size={13} />
          </button>
        </form>

        {memory.length === 0 ? (
          <p className="mt-2.5 text-[11px] text-muted-foreground">Nothing remembered yet.</p>
        ) : (
          <ul className="mt-2.5 space-y-1">
            {memory.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2 rounded-lg bg-secondary/60 px-2.5 py-1.5 text-[11.5px]"
              >
                <span className="min-w-0 flex-1 leading-relaxed">{item.text}</span>
                <button
                  type="button"
                  onClick={() => removeFact(item.id)}
                  aria-label="Forget this fact"
                  className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <X size={11} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}