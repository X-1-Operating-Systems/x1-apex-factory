import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import moment from 'moment';

const STATUS = {
  draft: { label: 'Draft', dot: 'bg-muted-foreground/50' },
  editing: { label: 'In studio', dot: 'bg-primary' },
  review: { label: 'In review', dot: 'bg-amber-500' },
  ready: { label: 'Ready for approval', dot: 'bg-emerald-500' },
  live: { label: 'Live', dot: 'bg-emerald-600' },
};

export default function ProjectRow({ project }) {
  const status = STATUS[project.status] || STATUS.draft;

  return (
    <Link
      to={`/studio/${project.id}`}
      className="group flex items-center gap-3 border-b border-border/60 px-4 py-3 transition-colors last:border-0 hover:bg-accent/40"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium tracking-tight">{project.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {project.client_name || 'Unassigned client'} · {project.template_name || 'Blank canvas'}
        </p>
      </div>
      <span className="hidden shrink-0 text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground sm:block">{status.label}</span>
      <span className="shrink-0 text-[10.5px] text-muted-foreground">
        {project.updated_date ? moment(project.updated_date).fromNow() : 'New'}
      </span>
      <ArrowUpRight size={14} className="shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}