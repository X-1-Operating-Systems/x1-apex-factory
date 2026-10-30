import React, { useState } from 'react';
import { Activity, Database, RotateCw, Server } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ACTIONS = [
  { key: 'status', label: 'Check host', icon: Activity },
  { key: 'railway.up', label: 'Redeploy', icon: RotateCw },
  { key: 'supabase.migrate', label: 'Sync database', icon: Database },
  { key: 'verify.all', label: 'Verify stack', icon: Server },
];

function line(action, payload) {
  if (!payload || payload.ok === false) return payload?.error || 'No answer from the host.';
  if (action === 'status') {
    return `${payload.data.host_url || 'not resolved'} · ${payload.data.healthy ? 'healthy' : 'unreachable'} · deploy ${payload.data.railway?.status || 'unknown'}`;
  }
  if (action === 'railway.up') {
    return `deploy ${payload.data.deployment?.status || 'queued'} · ${payload.data.healthy ? 'answering' : 'not answering yet'}`;
  }
  if (action === 'supabase.migrate') {
    const counts = payload.counts || {};
    return `${payload.project} · ${Object.entries(counts).map(([k, v]) => `${k.replace('host_', '')} ${v ?? '—'}`).join(' · ')}`;
  }
  const steps = payload.data?.steps || [];
  return steps.map((s) => `${s.ok ? '✓' : '✗'} ${s.step}`).join('  ');
}

export default function ProvisionRow() {
  const [busy, setBusy] = useState(null);
  const [result, setResult] = useState(null);

  const run = async (action) => {
    setBusy(action);
    setResult(null);
    try {
      const res = await base44.functions.invoke('hostProvision', { action });
      setResult({ action, payload: res.data });
    } catch (error) {
      setResult({ action, payload: { ok: false, error: error.message } });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="border-b border-border px-4 py-2 lg:px-6">
      <div className="flex flex-wrap items-center gap-1.5">
        {ACTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => run(key)}
            disabled={Boolean(busy)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <Icon size={10} className={busy === key ? 'animate-spin' : undefined} />
            {label}
          </button>
        ))}
        {result && (
          <span className={`min-w-0 flex-1 truncate text-[10.5px] ${result.payload?.ok === false ? 'text-destructive' : 'text-muted-foreground'}`}>
            {line(result.action, result.payload)}
          </span>
        )}
      </div>
    </div>
  );
}