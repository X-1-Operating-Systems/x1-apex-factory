import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import moment from 'moment';

const STATUS = {
  draft: { label: 'Draft', tone: 'bg-muted text-muted-foreground' },
  editing: { label: 'In studio', tone: 'bg-primary/12 text-primary' },
  review: { label: 'In review', tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' },
  ready: { label: 'Ready for approval', tone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  live: { label: 'Live', tone: 'bg-emerald-600 text-white' },
};

export default function ProjectCard({ project, pageCount }) {
  const status = STATUS[project.status] || STATUS.draft;
  const pages = pageCount === undefined ? null : `${pageCount} page${pageCount === 1 ? '' : 's'}`;

  return (
    <Link
      to={`/studio/${project.id}`}
      className="glass-panel group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_-28px_rgba(23,55,140,0.55)]"
    >
      <div className="h-1 w-full" style={{ background: project.accent || '#b4532a' }} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ${status.tone}`}>
            {status.label}
          </span>
          <ArrowUpRight size={15} className="text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>

        <h3 className="mt-3 text-[17px] font-medium leading-snug tracking-tight">{project.name}</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">{project.client_name || 'Unassigned client'}</p>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-[10.5px] text-muted-foreground">
          <span className="truncate">
            {pages && <span className="text-foreground/70">{pages} · </span>}
            {project.template_name || 'Blank canvas'}
          </span>
          <span className="shrink-0">{project.updated_date ? moment(project.updated_date).fromNow() : 'New'}</span>
        </div>
      </div>
    </Link>
  );
}