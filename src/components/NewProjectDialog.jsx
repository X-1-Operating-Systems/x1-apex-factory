import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function NewProjectDialog({ open, onOpenChange, templates, initialTemplateId, initialName }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(initialName || '');
      setClient('');
      setError('');
      setTemplateId(initialTemplateId || templates?.[0]?.id || '');
    }
  }, [open, initialTemplateId, templates, initialName]);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give the project a name.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const tpl = templates.find((t) => t.id === templateId);
      const project = await base44.entities.Project.create({
        name: name.trim(),
        client_name: client.trim(),
        description: tpl?.tagline || '',
        template_id: tpl?.id || '',
        template_name: tpl?.name || 'Blank canvas',
        accent: tpl?.accent || '#b4532a',
        surface: tpl?.surface || 'light',
        headline_font: tpl?.headline_font || 'serif',
        status: 'draft',
      });
      await base44.entities.StudioPage.create({
        project_id: project.id,
        name: 'Home',
        path: '/',
        version: 1,
        blocks: (tpl?.blocks || []).map((b, i) => ({ id: `${b.type}_${i}_${Math.random().toString(36).slice(2, 6)}`, type: b.type, props: b.props || {} })),
        seo_title: `${name.trim()}${tpl?.tagline ? ` — ${tpl.tagline}` : ''}`,
        seo_description: tpl?.description || '',
      });
      onOpenChange(false);
      navigate(`/studio/${project.id}`);
    } catch (err) {
      setError(err?.message || 'Could not create the project.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="display-title text-2xl">New client build</DialogTitle>
          <DialogDescription>Start from a template. The canvas opens with the structure already composed.</DialogDescription>
        </DialogHeader>

        <form onSubmit={create} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="project-name" className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Project name</Label>
            <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Northline Coatings — website" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client-name" className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Client</Label>
            <Input id="client-name" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Northline Coatings LLC" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="template" className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Starting template</Label>
            <select
              id="template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:border-foreground"
            >
              <option value="">Blank canvas</option>
              {(templates || []).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-[12px] text-destructive">{error}</p>}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Opening studio…' : 'Open studio'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}