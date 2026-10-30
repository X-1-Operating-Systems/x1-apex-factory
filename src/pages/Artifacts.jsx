import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search } from 'lucide-react';
import ArtifactCard from '@/components/manus/ArtifactCard';

const FILTERS = [
  ['all', 'All'],
  ['website', 'Websites'],
  ['documents', 'Documents'],
  ['slides', 'Slides'],
  ['spreadsheets', 'Sheets'],
  ['images', 'Images'],
  ['videos', 'Video'],
  ['audio', 'Audio'],
  ['others', 'Files'],
];

export default function Artifacts() {
  const [artifacts, setArtifacts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [moreBusy, setMoreBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const res = await base44.functions.invoke('manusAgent', { action: 'artifacts', type: 'all', limit: 24 });
        if (!live) return;
        setArtifacts(res.data.artifacts || []);
        setCursor(res.data.next_cursor);
        setHasMore(Boolean(res.data.has_more));
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
    const res = await base44.functions.invoke('manusAgent', { action: 'artifacts', type: 'all', limit: 24, cursor });
    setArtifacts((prev) => [...prev, ...(res.data.artifacts || [])]);
    setCursor(res.data.next_cursor);
    setHasMore(Boolean(res.data.has_more));
    setMoreBusy(false);
  };

  const visible = useMemo(
    () =>
      artifacts.filter(
        (item) =>
          (type === 'all' || item.type === type) &&
          (!query.trim() ||
            `${item.name} ${item.task_title || ''}`.toLowerCase().includes(query.trim().toLowerCase()))
      ),
    [artifacts, type, query]
  );

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[15px] font-medium">Artifacts</h1>
        <p className="text-[11.5px] text-muted-foreground">{artifacts.length} deliverables loaded</p>
      </div>
      <p className="mt-1.5 max-w-[62ch] text-[11.5px] leading-relaxed text-muted-foreground">
        Everything your agents produced — sites, documents, decks, sheets, images and files, each one tied back to the
        task that built it.
      </p>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <Search size={14} className="shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artifacts"
          aria-label="Search artifacts"
          className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setType(key)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              type === key ? 'glass-blue' : 'glass-frost text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 grid place-items-center py-16">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="mt-8 text-[12.5px] text-destructive">{error}</p>
      ) : visible.length === 0 ? (
        <p className="mt-10 text-center text-[12.5px] text-muted-foreground">
          {artifacts.length === 0
            ? 'Nothing produced yet. Run a task and its deliverables land here.'
            : 'No artifacts match this filter.'}
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} />
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