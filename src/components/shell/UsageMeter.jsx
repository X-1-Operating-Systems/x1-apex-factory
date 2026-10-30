import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function UsageMeter() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let live = true;
    const load = async () => {
      const [tasks, automations] = await Promise.all([
        base44.entities.StudioTask.count(),
        base44.entities.Automation.count(),
      ]);
      if (live) setStats({ tasks, automations });
    };
    load();
    return () => {
      live = false;
    };
  }, []);

  return (
    <Link
      to="/settings/usage"
      className="mt-1 flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[10.5px] text-muted-foreground transition-colors hover:bg-sidebar-accent/70 hover:text-foreground"
    >
      <span>{stats ? `${stats.tasks} sessions` : 'Loading usage'}</span>
      <span>{stats ? `${stats.automations} scheduled` : ''}</span>
    </Link>
  );
}