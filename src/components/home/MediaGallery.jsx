import React from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, Globe, Presentation } from 'lucide-react';

const ITEMS = [
  {
    key: 'video',
    label: 'Video',
    caption: 'Avatar and voice renders',
    to: '/video',
    icon: Clapperboard,
    wash: 'from-neutral-200 to-neutral-100',
  },
  {
    key: 'app',
    label: 'App',
    caption: 'Live websites and builds',
    to: '/websites',
    icon: Globe,
    wash: 'from-neutral-100 to-neutral-200',
  },
  {
    key: 'slides',
    label: 'Slides',
    caption: 'Documents and deliverables',
    to: '/artifacts',
    icon: Presentation,
    wash: 'from-neutral-200 to-neutral-50',
  },
];

export default function MediaGallery() {
  return (
    <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
      {ITEMS.map(({ key, label, caption, to, icon: Icon, wash }) => (
        <Link
          key={key}
          to={to}
          className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/20"
        >
          <span className={`flex h-[86px] items-center justify-center bg-gradient-to-br ${wash}`}>
            <Icon size={22} strokeWidth={1.5} className="text-foreground/35" />
          </span>
          <span className="block px-3 py-2">
            <span className="block text-[11.5px] font-medium text-foreground">{label}</span>
            <span className="block truncate text-[10.5px] text-muted-foreground">{caption}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}