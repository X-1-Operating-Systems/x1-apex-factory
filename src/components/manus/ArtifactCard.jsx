import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, FileText, Film, Globe, Image as ImageIcon, Music, Presentation, Sheet, Star } from 'lucide-react';
import { Image } from '@/components/ui/image';

const TYPES = {
  website: { label: 'Website', icon: Globe },
  documents: { label: 'Document', icon: FileText },
  slides: { label: 'Slides', icon: Presentation },
  spreadsheets: { label: 'Spreadsheet', icon: Sheet },
  images: { label: 'Image', icon: ImageIcon },
  videos: { label: 'Video', icon: Film },
  audio: { label: 'Audio', icon: Music },
  others: { label: 'File', icon: FileText },
};

const when = (value) => {
  if (!value) return '';
  const ts = Number(value);
  if (!ts) return '';
  return new Date(ts > 1e12 ? ts : ts * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function ArtifactCard({ artifact, onSelect }) {
  const meta = TYPES[artifact.type] || TYPES.others;
  const Icon = meta.icon;

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/20">
      <button type="button" onClick={() => onSelect?.(artifact)} className="block w-full text-left">
        <div className="relative h-32 bg-secondary">
          {artifact.cover_image ? (
            <Image src={artifact.cover_image} alt={artifact.name} fittingType="fill" className="h-32 w-full" />
          ) : (
            <div className="grid h-32 place-items-center text-muted-foreground">
              <Icon size={20} />
            </div>
          )}
          {artifact.favorite && (
            <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-background/90 text-amber-500">
              <Star size={11} fill="currentColor" />
            </span>
          )}
        </div>
      </button>
      <div className="p-3">
        <div className="flex items-start gap-1.5">
          <Icon size={12} className="mt-[3px] shrink-0 text-muted-foreground" />
          <p className="min-w-0 flex-1 truncate text-[12.5px] font-medium">{artifact.name}</p>
        </div>
        <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
          {meta.label}
          {artifact.updated_at ? ` · ${when(artifact.updated_at)}` : ''}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(artifact)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] transition-colors hover:bg-secondary"
            >
              Details
            </button>
          )}
          {artifact.url && (
            <a
              href={artifact.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] transition-colors hover:bg-secondary"
            >
              Open <ExternalLink size={9} />
            </a>
          )}
          {artifact.task_id && (
            <Link
              to={`/task/${artifact.task_id}`}
              className="truncate rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {artifact.task_title || 'Task'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}