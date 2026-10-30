import React, { useMemo } from 'react';
import moment from 'moment';
import SessionRow from '@/components/shell/SessionRow';

function groupOf(date) {
  const d = moment(date);
  const now = moment();
  if (d.isSame(now, 'day')) return 'Today';
  if (d.isSame(now.clone().subtract(1, 'day'), 'day')) return 'Yesterday';
  if (d.isAfter(now.clone().subtract(7, 'day'))) return 'Previous 7 days';
  return 'Earlier';
}

const ORDER = ['Today', 'Yesterday', 'Previous 7 days', 'Earlier'];

export default function SessionList({ tasks, projects, onNavigate }) {
  const loose = useMemo(() => {
    const known = new Set((projects || []).map((p) => p.id));
    return (tasks || []).filter((task) => !task.project_id || !known.has(task.project_id));
  }, [tasks, projects]);

  const groups = useMemo(() => {
    const map = {};
    loose.forEach((task) => {
      const key = groupOf(task.created_date || task.updated_date);
      if (!map[key]) map[key] = [];
      map[key].push(task);
    });
    return ORDER.filter((k) => map[k]?.length).map((k) => [k, map[k]]);
  }, [loose]);

  if (groups.length === 0) {
    if (!(tasks || []).length) {
      return <p className="px-2.5 py-2 text-[11.5px] text-muted-foreground">No tasks yet</p>;
    }
    return null;
  }

  return (
    <div>
      {(projects || []).some((p) => (tasks || []).some((t) => t.project_id === p.id)) && (
        <p className="px-2.5 pb-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Tasks
        </p>
      )}
      <div className="space-y-4">
        {groups.map(([label, items]) => (
          <div key={label}>
            <p className="px-2.5 pb-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {label}
            </p>
            <div className="space-y-0.5">
              {items.map((task) => (
                <SessionRow key={task.id} task={task} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}