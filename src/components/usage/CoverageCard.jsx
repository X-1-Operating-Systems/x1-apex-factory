import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { SettingsCard } from '@/components/settings/SettingsUI';

const AREAS = [
  { label: 'Sessions', entity: 'StudioTask', to: '/library' },
  { label: 'Projects', entity: 'Project', to: '/' },
  { label: 'Agents', entity: 'StudioAgent', to: '/agents' },
  { label: 'Skills', entity: 'StudioSkill', to: '/skills' },
  { label: 'Scheduled', entity: 'Automation', to: '/automations' },
  { label: 'Connectors', entity: 'StudioConnector', to: '/plugins' },
  { label: 'Releases', entity: 'Deployment', to: '/releases' },
  { label: 'QA audits', entity: 'QaRun', to: '/releases' },
  { label: 'Domains', entity: 'SiteDomain', to: '/websites' },
  { label: 'Sharing', entity: 'ShareLink', to: '/websites' },
  { label: 'Files', entity: 'StudioFile', to: '/files' },
];

export default function CoverageCard() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let live = true;
    Promise.all(AREAS.map((area) => base44.entities[area.entity].count())).then((counts) => {
      if (live) setRows(AREAS.map((area, index) => ({ ...area, count: counts[index] })));
    });
    return () => {
      live = false;
    };
  }, []);

  const used = rows ? rows.filter((row) => row.count > 0).length : 0;
  const score = rows ? Math.round((used / rows.length) * 100) : 0;

  return (
    <SettingsCard
      title="Coverage"
      description="How much of the platform your workspace is running today."
      footer={
        <span className="text-[10.5px] text-muted-foreground">
          {rows ? `${used} of ${rows.length} areas in use` : 'Reading workspace'}
        </span>
      }
    >
      {!rows ? (
        <div className="grid place-items-center py-6">
          <Loader2 size={15} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-medium leading-none">{score}%</span>
            <span className="text-[11px] text-muted-foreground">of the studio in active use</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-foreground/80" style={{ width: `${score}%` }} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
            {rows.map((row) => {
              const active = row.count > 0;
              return (
                <Link
                  key={row.label}
                  to={row.to}
                  className="flex items-center gap-1.5 rounded-md py-1 text-[11.5px] transition-colors hover:text-foreground"
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-foreground' : 'border border-border'}`}
                  />
                  <span className={`min-w-0 flex-1 truncate ${active ? '' : 'text-muted-foreground'}`}>{row.label}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{row.count}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </SettingsCard>
  );
}