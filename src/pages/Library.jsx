import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ExternalLink, Loader2, Search, Square } from 'lucide-react';
import StatusPill from '@/components/manus/StatusPill';

const STATES = [
  ['all', 'All'],
  ['running', 'Running'],
  ['waiting', 'Waiting'],
  ['stopped', 'Done'],
  ['error', 'Failed'],
];

function when(seconds) {
  if (!seconds) return '';
  return new Date(seconds * 1000).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function Library() {
  const [tasks, setTasks] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [state, setState] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [moreBusy, setMoreBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const res = await base44.functions.invoke('manusAgent', { action: 'tasks', limit: 40 });
        if (!live) return;
        setTasks(res.data.tasks || []);
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
    const res = await base44.functions.invoke('manusAgent', { action: 'tasks', limit: 40, cursor });
    setTasks((prev) => [...prev, ...(res.data.tasks || [])]);
    setCursor(res.data.next_cursor);
    setHasMore(Boolean(res.data.has_more));
    setMoreBusy(false);
  };

  const stop = async (id) => {
    await base44.functions.invoke('manusAgent', { action: 'stop', task_id: id });
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'stopped' } : t)));
  };

  const visible = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (state === 'all' || t.status === state) &&
          (!query.trim() || t.title.toLowerCase().includes(query.trim().toLowerCase()))
      ),
    [tasks, state, query]
  );

  return (
    <div className="mx-auto w-full max-w-[1000px] px-5 py-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[15px] font-medium">Library</h1>
        <p className="text-[11.5px] text-muted-foreground">{tasks.length} tasks in your Manus account</p>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <Search size={14} className="shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks"
          aria-label="Search tasks"
          className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {STATES.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setState(key)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              state === key ? 'glass-blue' : 'glass-frost text-muted-foreground hover:text-foreground'
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
          No tasks here yet. Start one from New task and it lands in this library.
        </p>
      ) : (
        <div className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {visible.map((task) => (
            <div key={task.id} className="flex items-center gap-3 px-3.5 py-2.5">
              <Link to={`/task/${task.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[12.5px] font-medium">{task.title || 'Untitled task'}</p>
                  <StatusPill status={task.status} />
                </div>
                <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                  {task.type.replace('_', ' ')} · {when(task.created_at)}
                </p>
              </Link>
              {(task.status === 'running' || task.status === 'waiting') && (
                <button
                  type="button"
                  onClick={() => stop(task.id)}
                  className="shrink-0 rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Stop task"
                >
                  <Square size={11} />
                </button>
              )}
              {task.task_url && (
                <a
                  href={task.task_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open in Manus"
                  className="shrink-0 rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}