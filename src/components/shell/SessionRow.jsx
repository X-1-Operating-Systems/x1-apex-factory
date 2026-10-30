import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SessionRow({ task, onNavigate }) {
  return (
    <NavLink
      to={`/task/${task.id}`}
      onClick={onNavigate}
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
  );
}