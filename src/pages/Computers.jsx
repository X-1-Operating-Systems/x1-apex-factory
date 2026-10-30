import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Monitor, RefreshCw } from 'lucide-react';
import HostSessions from '@/components/computers/HostSessions';

export default function Computers() {
  const [browsers, setBrowsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('manusAgent', { action: 'browsers' });
      setBrowsers(res.data.browsers || []);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const refresh = () => {
    setReloadKey((key) => key + 1);
    load();
  };

  return (
    <div className="mx-auto w-full max-w-[1000px] px-5 py-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[15px] font-medium">Computers</h1>
        <button
          type="button"
          onClick={refresh}
          className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <RefreshCw size={11} /> Refresh
        </button>
      </div>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
        The browsers this workspace runs. Your own host serves every session the control plane or a browser run opens;
        Manus devices are the browsers signed into your Manus account.
      </p>

      <section className="mt-6">
        <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Your browser host</p>
        <HostSessions reloadKey={reloadKey} />
      </section>

      <section className="mt-8">
        <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Manus devices</p>
        {loading ? (
          <div className="mt-6 grid place-items-center py-10">
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="mt-3 text-[12.5px] text-destructive">{error}</p>
        ) : browsers.length === 0 ? (
          <div className="mt-3 rounded-xl border border-border bg-card px-4 py-6 text-center">
            <Monitor size={18} className="mx-auto text-muted-foreground" />
            <p className="mt-2 text-[12.5px] font-medium">No online Manus devices</p>
            <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed text-muted-foreground">
              Sign in to Manus with the browser helper on a Mac, Windows machine, or cloud computer, then refresh this page.
            </p>
          </div>
        ) : (
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {browsers.map((browser) => (
              <div key={browser.id} className="rounded-xl border border-border bg-card p-3.5">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary">
                    <Monitor size={13} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium">{browser.name}</p>
                    <p className="truncate text-[10.5px] text-muted-foreground">{browser.id}</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-[1px] text-[10px] text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-emerald-500" /> online
                  </span>
                </div>
                {browser.ua && <p className="mt-2 line-clamp-2 text-[10.5px] leading-relaxed text-muted-foreground">{browser.ua}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}