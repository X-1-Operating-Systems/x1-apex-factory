import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const normalizePath = (value) => {
  const clean = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
  if (!clean || clean === '/') return '/';
  return `/${clean.replace(/^\/+/, '').replace(/\/+$/, '')}`;
};

export default function PageDialog({ open, onOpenChange, page, takenPaths = [], onSave }) {
  const [name, setName] = useState('');
  const [path, setPath] = useState('/');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(page?.name || '');
    setPath(page?.path || '/');
    setError('');
  }, [open, page]);

  const submit = async () => {
    const title = name.trim();
    if (!title) {
      setError('Give the page a name.');
      return;
    }
    const nextPath = normalizePath(path);
    if (takenPaths.includes(nextPath)) {
      setError('Another page already uses that path.');
      return;
    }
    try {
      await onSave({ name: title, path: nextPath });
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'That page could not be saved.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-medium">{page ? 'Edit page' : 'New page'}</DialogTitle>
          <DialogDescription>Each page gets its own sections and SEO.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5">
          <div>
            <label htmlFor="page-name" className="text-[11.5px] text-muted-foreground">
              Page name
            </label>
            <Input id="page-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Services" className="mt-1" />
          </div>
          <div>
            <label htmlFor="page-path" className="text-[11.5px] text-muted-foreground">
              Path
            </label>
            <Input id="page-path" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/services" className="mt-1" />
          </div>
          {error && <p className="text-[11.5px] text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit}>
            {page ? 'Save page' : 'Add page'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}