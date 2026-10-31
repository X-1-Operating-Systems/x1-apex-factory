import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import MeshSummary from '@/components/mesh/MeshSummary';
import NodeCard from '@/components/mesh/NodeCard';

export default function Mesh() {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  const load = async (action = 'state') => {
    setBusy(true);
    setError('');
    try {
      const { data } = await base44.functions.invoke('meshStatus', { action });
      setState(data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const beat = async () => {
    await load('beat');
  };

  return (
    <div className="mx-auto max-w-[960px] px-5 py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-[24px] leading-tight">Connection mesh</h1>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Every system this project talks to, asked directly. A node only shows as up when a real call answered.
          </p>
        </div>
        <Button size="sm" onClick={beat} disabled={busy} className="h-8 gap-1.5 text-[11.5px]">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Run heartbeat
        </Button>
      </div>

      {error && <p className="mt-4 text-[11.5px] text-destructive">{error}</p>}

      {state && (
        <>
          <div className="mt-5">
            <MeshSummary ok={state.ok} total={state.total} score={state.score} checkedAt={state.checked_at} />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {(state.nodes || []).map((node) => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>

          <div className="mt-7">
            <p className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">Heartbeat history</p>
            {(state.runs || []).length === 0 ? (
              <p className="mt-2 text-[11.5px] text-muted-foreground">
                No heartbeat recorded yet. The clock runs every 15 minutes, or press Run heartbeat now.
              </p>
            ) : (
              <div className="mt-2 divide-y divide-border rounded-lg border border-border">
                {(state.runs || []).map((run) => (
                  <div key={run.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <p className="text-[11.5px]">
                      {run.ok}/{run.total} answering
                      <span className="ml-2 text-muted-foreground">{run.note}</span>
                    </p>
                    <p className="shrink-0 text-[10.5px] text-muted-foreground">
                      {new Date(run.at || run.created_date).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!state && busy && (
        <p className="mt-6 flex items-center gap-2 text-[11.5px] text-muted-foreground">
          <Loader2 size={13} className="animate-spin" /> Asking every system…
        </p>
      )}
    </div>
  );
}