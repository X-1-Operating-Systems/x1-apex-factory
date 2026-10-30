import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plug } from 'lucide-react';

const TYPE_LABEL = { builtin: 'Built-in', byok: 'Own key', mcp: 'MCP' };

export default function Plugins() {
  const [connectors, setConnectors] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const res = await base44.functions.invoke('manusAgent', { action: 'connectors' });
        if (live) setConnectors(res.data.connectors || []);
      } catch (err) {
        if (live) setError(err?.response?.data?.error || err.message);
      } finally {
        if (live) setLoading(false);
      }
    };
    load();
    return () => {
      live = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(connectors.map((c) => c.category).filter(Boolean))];
    return ['all', ...unique.slice(0, 10)];
  }, [connectors]);

  const visible = category === 'all' ? connectors : connectors.filter((c) => c.category === category);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-8 lg:px-10 lg:py-10">
      <h1 className="text-[15px] font-medium">Plugins</h1>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
        Connectors installed on your Manus account. Agents can reach these services during a run.
      </p>

      {loading ? (
        <div className="mt-6 grid place-items-center py-16">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="mt-8 text-[12.5px] text-destructive">{error}</p>
      ) : connectors.length === 0 ? (
        <div className="mt-5 rounded-xl border border-border bg-card px-4 py-6 text-center">
          <Plug size={18} className="mx-auto text-muted-foreground" />
          <p className="mt-2 text-[12.5px] font-medium">No connectors installed</p>
          <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed text-muted-foreground">
            Add connectors in Manus settings and they appear here, ready to attach to a task.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {categories.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                  category === key ? 'glass-blue' : 'glass-frost text-muted-foreground hover:text-foreground'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((connector) => (
              <div key={connector.id} className="rounded-xl border border-border bg-card p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[12.5px] font-medium">{connector.name}</p>
                  <span className="shrink-0 rounded-full border border-border px-1.5 py-[1px] text-[10px] text-muted-foreground">
                    {TYPE_LABEL[connector.type] || connector.type}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                  {connector.description || 'Connected service'}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}