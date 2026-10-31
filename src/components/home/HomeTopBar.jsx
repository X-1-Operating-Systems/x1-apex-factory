import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import ModelPicker from '@/components/composer/ModelPicker';

export default function HomeTopBar({ options, onChange, disabled, runCount }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <ModelPicker options={options} onChange={onChange} disabled={disabled} />

      <div className="flex items-center gap-2">
        <span className="rounded-full border border-border px-2.5 py-[3px] text-[10.5px] text-muted-foreground">
          Private workspace
        </span>
        <Link
          to="/settings/usage"
          className="rounded-full bg-foreground px-2.5 py-[4px] text-[10.5px] font-medium text-background transition-opacity hover:opacity-85"
        >
          Usage
        </Link>
        <Link
          to="/library"
          title="Tasks in this studio"
          aria-label="Tasks in this studio"
          className="inline-flex items-center gap-1 rounded-full px-1.5 py-[3px] text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Sparkles size={11} /> {runCount === null ? '·' : runCount}
        </Link>
      </div>
    </div>
  );
}