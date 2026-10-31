import React, { useEffect, useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import WebsiteCard from '@/components/manus/WebsiteCard';
import { listArtifacts } from '@/lib/taskEngine';

export default function Websites() {
  const [sites, setSites] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [moreBusy, setMoreBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const res = await listArtifacts({ type: 'website', limit: 24 });
        if (!live) return;
        setSites(res.artifacts || []);
        setCursor(res.next_cursor);
        setHasMore(Boolean(res.has_more));
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

  const loadMore = async () => {
    if (!cursor || moreBusy) return;
    setMoreBusy(true);
    const res = await listArtifacts({ type: 'website', limit: 24, cursor });
    setSites((prev) => {
      const seen = new Set(prev.map((item) => item.id));
      return [...prev, ...(res.artifacts || []).filter((item) => !seen.has(item.id))];
    });
    setCursor(res.next_cursor);
    setHasMore(Boolean(res.has_more));
    setMoreBusy(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-8 lg:px-10 lg:py-10">
      <h1 className="text-[15px] font-medium">Websites</h1>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
        Sites built by your agents. Native builds open straight into their build task; Manus builds also carry version
        history and a hosted URL once deployed.
      </p>

      {loading ? (
        <div className="mt-6 grid place-items-center py-16">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="mt-8 text-[12.5px] text-destructive">{error}</p>
      ) : sites.length === 0 ? (
        <div className="mt-5 rounded-xl border border-border bg-card px-4 py-6 text-center">
          <Globe size={18} className="mx-auto text-muted-foreground" />
          <p className="mt-2 text-[12.5px] font-medium">No websites yet</p>
          <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed text-muted-foreground">
            Ask an agent to build a web app, and it lands here ready to publish.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <WebsiteCard key={site.id} site={site} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={moreBusy}
                className="glass-frost rounded-full px-4 py-1.5 text-[11.5px] font-medium disabled:opacity-50"
              >
                {moreBusy ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}