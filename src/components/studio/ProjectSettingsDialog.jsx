import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function ProjectSettingsDialog({ open, onOpenChange, project, onSaved }) {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [instruction, setInstruction] = useState('');
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !project) return;
    setName(project.name || '');
    setClient(project.client_name || '');
    setInstruction(project.master_instruction || '');
    setPinned(Boolean(project.pinned));
    setError('');
  }, [open, project]);

  const save = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('A project needs a name.');
      return;
    }
    setBusy(true);
    setError('');
    const patch = {
      name: name.trim(),
      client_name: client.trim(),
      master_instruction: instruction.trim(),
      pinned,
    };
    try {
      await base44.entities.Project.update(project.id, patch);
      if (onSaved) onSaved(patch);
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'Could not save this project.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-medium">Project settings</DialogTitle>
          <DialogDescription>
            The master instruction is applied to every task started from this project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={save} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="project-title" className="text-[11.5px] text-muted-foreground">Name</Label>
            <Input id="project-title" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="project-client" className="text-[11.5px] text-muted-foreground">Client</Label>
            <Input id="project-client" value={client} onChange={(e) => setClient(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="project-instruction" className="text-[11.5px] text-muted-foreground">Master instruction</Label>
            <Textarea
              id="project-instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={5}
              placeholder="Voice, audience, constraints, and the standing rules every task in this project should follow."
              className="text-[12.5px] leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-[12px] font-medium">Pin to top</p>
              <p className="text-[11px] text-muted-foreground">Keeps this project first in the sidebar.</p>
            </div>
            <Switch checked={pinned} onCheckedChange={setPinned} aria-label="Pin project" />
          </div>

          {error && <p className="text-[12px] text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Saving…' : 'Save project'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}