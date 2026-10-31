import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, FolderOpen, Palette, Wrench } from 'lucide-react';

const CARDS = [
  {
    key: 'build',
    title: 'Build',
    note: 'Websites, apps, and games',
    icon: Wrench,
    iconClass: 'bg-blue-50 text-blue-600',
    seed: 'Build a website with a hero, features, pricing and contact page.',
  },
  {
    key: 'create',
    title: 'Create',
    note: 'Slides, images, and videos',
    icon: Palette,
    iconClass: 'bg-amber-50 text-amber-600',
    seed: 'Create a set of presentation slides with images and a short video.',
  },
];

export default function ActionCards({ onPick }) {
  return (
    <div className="mt-8 grid gap-2.5 sm:grid-cols-3">
      {CARDS.map(({ key, title, note, icon: Icon, iconClass, seed }) => (
        <button
          key={key}
          type="button"
          onClick={() => onPick(seed)}
          className="group flex flex-col rounded-xl border border-border bg-secondary px-3.5 py-3 text-left transition-colors hover:bg-accent"
        >
          <span className={`grid h-7 w-7 place-items-center rounded-lg ${iconClass}`}>
            <Icon size={14} strokeWidth={1.9} />
          </span>
          <span className="mt-2.5 flex items-center gap-1 text-[13px] font-medium text-foreground">
            {title}
            <ArrowUpRight
              size={12}
              className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
          <span className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{note}</span>
        </button>
      ))}

      <Link
        to="/files"
        className="group flex flex-col rounded-xl border border-border bg-secondary px-3.5 py-3 transition-colors hover:bg-accent"
      >
        <span className="flex items-start justify-between">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-foreground/5 text-foreground">
            <FolderOpen size={14} strokeWidth={1.9} />
          </span>
          <span className="text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Studio only</span>
        </span>
        <span className="mt-2.5 text-[13px] font-medium text-foreground">Start from a local file</span>
        <span className="mt-0.5 text-[11px] leading-snug text-muted-foreground">Open local files in X1 Studio</span>
      </Link>
    </div>
  );
}