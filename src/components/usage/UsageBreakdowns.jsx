import React from 'react';
import { SettingsCard } from '@/components/settings/SettingsUI';

const ENGINES = [
  ['native', 'Native engine'],
  ['manus', 'Manus account'],
];

const DELIVERABLE_LABELS = {
  website: 'Websites',
  documents: 'Documents',
  slides: 'Slides',
  spreadsheets: 'Spreadsheets',
  images: 'Images',
  others: 'Other',
};

function Bars({ rows, total }) {
  return (
    <div className="space-y-2">
      {rows.map(([label, count]) => {
        const share = total ? Math.round((count / total) * 100) : 0;
        return (
          <div key={label}>
            <div className="flex items-center justify-between text-[11.5px]">
              <span>{label}</span>
              <span className="text-muted-foreground">
                {count} · {share}%
              </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-foreground/70" style={{ width: `${share}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function UsageBreakdowns({ tasks }) {
  const engineCounts = tasks.reduce((acc, task) => {
    const key = task.engine || 'native';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const deliverableCounts = tasks.reduce((acc, task) => {
    const key = task.deliverable?.type;
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const engineRows = ENGINES.filter(([key]) => engineCounts[key]).map(([key, label]) => [label, engineCounts[key]]);
  const deliverableRows = Object.keys(DELIVERABLE_LABELS)
    .filter((key) => deliverableCounts[key])
    .map((key) => [DELIVERABLE_LABELS[key], deliverableCounts[key]]);

  return (
    <div className="grid gap-2 md:grid-cols-2">
      <SettingsCard title="Engine mix" description="Where your sessions actually ran.">
        {engineRows.length === 0 ? (
          <p className="text-[11.5px] text-muted-foreground">No sessions yet.</p>
        ) : (
          <Bars rows={engineRows} total={tasks.length} />
        )}
      </SettingsCard>

      <SettingsCard title="Deliverable mix" description="What your sessions produced.">
        {deliverableRows.length === 0 ? (
          <p className="text-[11.5px] text-muted-foreground">No deliverables yet.</p>
        ) : (
          <Bars rows={deliverableRows} total={deliverableRows.reduce((sum, [, n]) => sum + n, 0)} />
        )}
      </SettingsCard>
    </div>
  );
}