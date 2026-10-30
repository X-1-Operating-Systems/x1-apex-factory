import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { listProjectFiles, openFile, prettySize, registerFiles, removeFile } from '@/lib/files';

export default function ProjectFiles({ project }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef(null);

  useEffect(() => {
    if (!project?.id) return;
    listProjectFiles(project.id)
      .then((page) => setFiles(page.items || []))
      .catch(() => setFiles([]));
  }, [project?.id]);

  const add = async (event) => {
    const picked = Array.from(event.target.files || []).slice(0, 5);
    event.target.value = '';
    if (!picked.length) return;
    setBusy(true);
    setError('');
    try {
      const uploaded = [];
      for (const file of picked) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        uploaded.push({ name: file.name, file_uri, mime_type: file.type, size: file.size });
      }
      const created = await registerFiles(uploaded, { source: 'studio', project_id: project.id });
      setFiles((prev) => [...created, ...prev]);
    } catch (err) {
      setError(err?.message || 'That file could not be added.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (file) => {
    await removeFile(file.id);
    setFiles((prev) => prev.filter((item) => item.id !== file.id));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-muted-foreground">Knowledge-base files</span>
        <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Add
        </Button>
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Every run started in this project reads these files as its standing reference.
      </p>

      {files.length > 0 && (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-2 px-2.5 py-1.5">
              <FileText size={12} className="shrink-0 text-muted-foreground" />
              <button
                type="button"
                onClick={() => openFile(file)}
                className="min-w-0 flex-1 truncate text-left text-[11.5px] hover:underline"
              >
                {file.name}
              </button>
              <span className="shrink-0 text-[10px] text-muted-foreground">{prettySize(file.size)}</span>
              <button
                type="button"
                onClick={() => remove(file)}
                aria-label={`Remove ${file.name}`}
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-[11px] text-destructive">{error}</p>}
      <input ref={input} type="file" multiple onChange={add} className="hidden" aria-hidden="true" tabIndex={-1} />
    </div>
  );
}