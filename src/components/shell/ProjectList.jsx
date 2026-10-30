import React, { useMemo, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import SessionRow from '@/components/shell/SessionRow';

export default function ProjectList({ projects, tasks, onNavigate }) {
  const [open, setOpen] = useState({});

  const sorted = useMemo(
    () =>
      [...(projects || [])].sort(
        (a, b) =>
          (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (a.sort_order || 0) - (b.sort_order || 0)
      ),
    [projects]
  );

  const byProject = useMemo(() => {
    const map = {};
    (tasks || []).forEach((task) => {
      if (!task.project_id) return;
      if (!map[task.project_id]) map[task.project_id] = [];
      map[task.project_id].push(task);
    });
    return map;
  }, [tasks]);

  const toggle = (id) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

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
          {sorted.map((project) => {
            const items = byProject[project.id] || [];
            const expanded = Boolean(open[project.id]);
            return (
              <div key={project.id}>
                <div className="flex items-center gap-0.5">
                  <NavLink
                    to={`/studio/${project.id}`}
                    onClick={onNavigate}
                    title={project.name}
                    className={({ isActive }) =>
                      `session-row min-w-0 flex-1 truncate rounded-lg px-2.5 py-[7px] text-[12.5px] leading-tight transition-colors ${
                        isActive
                          ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
                      }`
                    }
                  >
                    {project.name}
                  </NavLink>
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggle(project.id)}
                      aria-expanded={expanded}
                      aria-label={`${expanded ? 'Hide' : 'Show'} ${items.length} task${items.length === 1 ? '' : 's'} in ${project.name}`}
                      className="flex shrink-0 items-center gap-0.5 rounded-md px-1 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
                    >
                      <span className="tabular-nums">{items.length}</span>
                      <ChevronRight size={11} className={expanded ? 'rotate-90 transition-transform' : 'transition-transform'} />
                    </button>
                  )}
                </div>

                {expanded && items.length > 0 && (
                  <div className="ml-2.5 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-1.5">
                    {items.map((task) => (
                      <SessionRow key={task.id} task={task} onNavigate={onNavigate} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}