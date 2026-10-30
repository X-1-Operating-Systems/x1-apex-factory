import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Image as ImageIcon, Loader2, Music, Trash2, Video } from 'lucide-react';
import { openFile, prettySize, removeFile } from '@/lib/files';

const ICON = (mime = '') => {
  if (mime.startsWith('image/')) return ImageIcon;
  if (mime.startsWith('video/')) return Video;
  if (mime.startsWith('audio/')) return Music;
  return FileText;
};

const when = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function FileRow({ file, onRemoved }) {
  const Icon = ICON(file.mime_type);
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(false);

  const open = async () => {
    setOpening(true);
    try {
      await openFile(file);
    } finally {
      setOpening(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await removeFile(file.id);
      onRemoved(file.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <button
        type="button"
        onClick={open}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label={`Open ${file.name}`}
      >
        {opening ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
      </button>

      <div className="min-w-0 flex-1">
        <button type="button" onClick={open} className="block max-w-full truncate text-left text-[12.5px] font-medium hover:underline">
          {file.name}
        </button>
        <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
          {[prettySize(file.size), file.mime_type, when(file.created_date)].filter(Boolean).join(' · ')}
        </p>
      </div>

      {file.task_id ? (
        <Link
          to={`/task/${file.task_id}`}
          className="hidden shrink-0 truncate rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-block max-w-[180px]"
        >
          {file.task_title || 'Task'}
        </Link>
      ) : (
        <span className="hidden text-[10.5px] text-muted-foreground sm:inline">Unattached</span>
      )}

      <button
        type="button"
        onClick={remove}
        disabled={busy}
        aria-label={`Remove ${file.name}`}
        className="shrink-0 rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive disabled:opacity-40"
      >
        {busy ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
      </button>
    </div>
  );
}