import React from 'react';
import { KeyRound } from 'lucide-react';
import useKeyStatus from '@/hooks/useKeyStatus';

// Shown when a key a surface depends on is absent. It names the exact secret, says what stops and
// what keeps working, so a dark feature reads as "not connected" rather than "broken".
export default function KeyNotice({ surfaceKey, surface, className = '' }) {
  const { loading, surfaces } = useKeyStatus();
  if (loading) return null;
  const entry = surfaces.find((item) => item.surface === surfaceKey);
  if (!entry || entry.ready) return null;

  return (
    <div
      className={`mt-3 flex gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 ${className}`}
    >
      <KeyRound size={12} className="mt-[2px] shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11.5px] font-medium">
          {entry.surface} is not connected{surface ? ` to ${surface}` : ''}.
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          Add <span className="font-mono text-[10.5px]">{entry.key}</span> to turn it on. Without it:{' '}
          {entry.stops.charAt(0).toLowerCase() + entry.stops.slice(1)} {entry.keeps}
        </p>
      </div>
    </div>
  );
}