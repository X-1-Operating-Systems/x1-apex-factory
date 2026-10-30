import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { SettingsCard } from '@/components/settings/SettingsUI';
import StatusPill from '@/components/manus/StatusPill';
import UsageBreakdowns from '@/components/usage/UsageBreakdowns';
import CoverageCard from '@/components/usage/CoverageCard';

export default function SettingsUsage() {
  const [recent, setRecent] = useState([]);
  const [windowTasks, setWindowTasks] = useState([]);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    const since = moment().subtract(13, 'days').startOf('day').toISOString();
    const load = async () => {
      const [total, windowPage, recentPage, automations, deployments, projects] = await Promise.all([
        base44.entities.StudioTask.count(),
        base44.entities.StudioTask.filter({ created_date: { $gte: since } }, { sort: '-created_date', limit: 500 }),
        base44.entities.StudioTask.filter({}, { sort: '-created_date', limit: 8 }),
        base44.entities.Automation.count(),
        base44.entities.Deployment.count(),
        base44.entities.Project.count(),
      ]);
      if (!live) return;
      setWindowTasks(windowPage.items);
      setRecent(recentPage.items);
      setCounts({ total, automations, deployments, projects });
      setLoading(false);
    };
    load();
    return () => {
      live = false;
    };
  }, []);

  const days = useMemo(() => {
    const buckets = Array.from({ length: 14 }, (_, index) => {
      const day = moment().subtract(13 - index, 'days');
      return { key: day.format('YYYY-MM-DD'), label: day.format('D'), count: 0 };
    });
    const index = Object.fromEntries(buckets.map((b) => [b.key, b]));
    windowTasks.forEach((task) => {
      const key = moment(task.created_date).format('YYYY-MM-DD');
      if (index[key]) index[key].count += 1;
    });
    return buckets;
  }, [windowTasks]);

  const peak = Math.max(1, ...days.map((d) => d.count));

  if (loading) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const stats = [
    ['Sessions', counts.total],
    ['Projects', counts.projects],
    ['Scheduled runs', counts.automations],
    ['Releases', counts.deployments],
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-card px-3 py-2.5">
            <p className="text-[17px] font-medium leading-tight">{value}</p>
            <p className="mt-0.5 text-[10.5px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <UsageBreakdowns tasks={windowTasks} />

      <SettingsCard title="Sessions, last 14 days" description="Where your studio time went.">
        <div className="flex h-[104px] items-end gap-1.5">
          {days.map((day) => (
            <div key={day.key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                title={`${day.count} on ${moment(day.key).format('MMM D')}`}
                className={`w-full rounded-sm ${day.count ? 'bg-foreground/80' : 'bg-border'}`}
                style={{ height: `${Math.max(3, (day.count / peak) * 78)}px` }}
              />
              <span className="text-[9px] text-muted-foreground">{day.label}</span>
            </div>
          ))}
        </div>
      </SettingsCard>

      <CoverageCard />

      <SettingsCard title="Recent sessions" description="Latest runs across both engines.">
        {recent.length === 0 ? (
          <p className="text-[11.5px] text-muted-foreground">No sessions yet. Start one from New task.</p>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((task) => (
              <Link key={task.id} to={`/task/${task.id}`} className="flex items-center gap-2 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium">{task.title || 'Untitled task'}</span>
                  <span className="block text-[10.5px] text-muted-foreground">
                    {moment(task.created_date).format('MMM D, h:mm a')} · {task.engine || 'native'}
                  </span>
                </span>
                <StatusPill status={task.status} />
              </Link>
            ))}
          </div>
        )}
      </SettingsCard>
    </>
  );
}