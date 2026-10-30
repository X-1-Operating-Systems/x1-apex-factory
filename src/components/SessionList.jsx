import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import moment from 'moment';

function groupOf(date) {
  const d = moment(date);
  const now = moment();
  if (d.isSame(now, 'day')) return 'Today';
  if (d.isSame(now.clone().subtract(1, 'day'), 'day')) return 'Yesterday';
  if (d.isAfter(now.clone().subtract(7, 'day'))) return 'Previous 7 days';
  return 'Earlier';
}

const ORDER = ['Today', 'Yesterday', 'Previous 7 days', 'Earlier'];

export default function SessionList({ tasks }) {
  const groups = useMemo(() => {
    const map = {};
    (tasks || []).forEach((task) => {
      const key = groupOf(task.created_date || task.updated_date);
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return ORDER.filter((k) => map[k]?.length).map((k) => [k, map[k]]);
  }, [tasks]);

  if (groups.length === 0) {
    return <p className="px-2.5 py-2 text-[11.5px] text-muted-foreground">No tasks yet</p>;
  }

  return (
    <div className="space-y-4">
      {groups.map(([label, items]) => (
        <div key={label}>
          <p className="px-2.5 pb-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {label}
          </p>
          <div className="space-y-0.5">
            {items.map((task) => (
              <NavLink
                key={task.id}
                to={`/task/${task.id}`}
                title={task.title || 'Untitled task'}
                className={({ isActive }) =>
                  `session-row flex items-center gap-1.5 rounded-lg px-2.5 py-[7px] text-[12.5px] leading-tight transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
                  }`
                }
              >
                <span className="min-w-0 flex-1 truncate">{task.title || 'Untitled task'}</span>
                {task.status === 'running' && (
                  <span className="h-1 w-1 shrink-0 animate-pulse rounded-full bg-info" aria-label="Running" />
                )}
                {task.status === 'error' && (
                  <span className="h-1 w-1 shrink-0 rounded-full bg-destructive" aria-label="Failed" />
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}