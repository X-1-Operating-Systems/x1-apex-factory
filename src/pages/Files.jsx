import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import FileRow from '@/components/files/FileRow';
import FileUploadButton from '@/components/files/FileUploadButton';
import { countFiles, listFiles } from '@/lib/files';

export default function Files() {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [moreBusy, setMoreBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (term) => {
    setLoading(true);
    setError('');
    try {
      const page = await listFiles({ query: term, limit: 30 });
      setFiles(page.items);
      setCursor(page.next_cursor);
      setHasMore(Boolean(page.has_more));
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    countFiles().then(setTotal).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(query), query ? 280 : 0);
    return () => clearTimeout(timer);
  }, [query, load]);

  const loadMore = async () => {
    if (!cursor || moreBusy) return;
    setMoreBusy(true);
    try {
      const page = await listFiles({ query, limit: 30, cursor });
      setFiles((prev) => {
        const seen = new Set(prev.map((f) => f.id));
        return [...prev, ...page.items.filter((f) => !seen.has(f.id))];
      });
      setCursor(page.next_cursor);
      setHasMore(Boolean(page.has_more));
    } finally {
      setMoreBusy(false);
    }
  };

  const removed = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setTotal((n) => Math.max(0, n - 1));
  };

  return (
    <div className="mx-auto w-full max-w-[900px] px-5 py-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[15px] font-medium">Files</h1>
        <div className="flex items-center gap-2.5">
          <p className="text-[11.5px] text-muted-foreground">{total} uploaded</p>
          <FileUploadButton
            onUploaded={(created) => {
              setFiles((prev) => [...created, ...prev]);
              setTotal((n) => n + created.length);
            }}
          />
        </div>
      </div>
      <p className="mt-1.5 max-w-[62ch] text-[11.5px] leading-relaxed text-muted-foreground">
        Everything you have handed the studio — references, briefs, screenshots and data files, stored privately and tied
        to the task that used them.
      </p>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <Search size={14} className="shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search files"
          aria-label="Search files"
          className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      {loading ? (
        <div className="mt-6 grid place-items-center py-16">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="mt-8 text-[12.5px] text-destructive">{error}</p>
      ) : files.length === 0 ? (
        <p className="mt-10 text-center text-[12.5px] text-muted-foreground">
          {query.trim() ? 'No files match that search.' : 'No files yet. Attach something to a task and it lands here.'}
        </p>
      ) : (
        <>
          <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {files.map((file) => (
              <FileRow key={file.id} file={file} onRemoved={removed} />
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