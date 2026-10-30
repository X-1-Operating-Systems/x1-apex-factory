import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function ProjectList({ projects }) {
  const sorted = [...(projects || [])].sort(
    (a, b) =>
      (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
      (a.sort_order || 0) - (b.sort_order || 0)
  );

  return (
    <div>
      <div className="flex items-center justify-between px-2.5 pb-1">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Projects</p>
        <Link
          to="/templates"
          className="text-[10.5px] text-muted-foreground transition-colors hover:text-foreground"
        >
          New
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="px-2.5 py-1 text-[11.5px] text-muted-foreground">No projects yet</p>
      ) : (
        <div className="space-y-0.5">
          {sorted.map((project) => (
            <NavLink
              key={project.id}
              to={`/studio/${project.id}`}
              title={project.name}
              className={({ isActive }) =>
                `session-row block truncate rounded-lg px-2.5 py-[7px] text-[12.5px] leading-tight transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
                }`
              }
            >
              {project.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}