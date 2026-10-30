import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Monitor, Square } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatusPill from '@/components/manus/StatusPill';
import TaskTimeline from '@/components/task/TaskTimeline';
import TaskFollowUp from '@/components/task/TaskFollowUp';
import ComputerPanel from '@/components/task/ComputerPanel';
import ComputerPane from '@/components/task/ComputerPane';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import DeliverableNote from '@/components/task/DeliverableNote';
import { taskDetail, stopTask, sendToTask } from '@/lib/taskEngine';
import { effortLabel, modelLabel } from '@/lib/taskOptions';
import TaskActions from '@/components/task/TaskActions';

const when = (ts) => {
  if (!ts) return '';
  const value = Number(ts);
  if (!value) return '';
  const date = new Date(value > 1e12 ? value : value * 1000);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function TaskDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stopping, setStopping] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [earlier, setEarlier] = useState({ events: [], cursor: null, hasMore: false });
  const [busyEarlier, setBusyEarlier] = useState(false);
  const [options, setOptions] = useState(null);
  const [isWide, setIsWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

  const load = useCallback(async () => {
    const res = await taskDetail(id);
    setData(res);
    setError('');
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setError(err?.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [load]);

  const task = data?.task;
  const running = task?.status === 'running' || task?.status === 'waiting';

  useEffect(() => {
    if (!task) return;
    setOptions(
      (prev) => prev || { model: task.model || 'gpt_5_6_sol', effort: task.effort || 'standard' }
    );
  }, [task]);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsWide(mql.matches);
    mql.addEventListener('change', onChange);
    setIsWide(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      load().catch(() => {});
    }, 4000);
    return () => clearInterval(timer);
  }, [running, load]);

  const events = useMemo(() => {
    const seen = new Set();
    const merged = [];
    for (const event of [...earlier.events, ...(data?.events || [])]) {
      if (event.id && seen.has(event.id)) continue;
      if (event.id) seen.add(event.id);
      merged.push(event);
    }
    return merged;
  }, [earlier.events, data]);

  const loadEarlier = async () => {
    const cursor = earlier.cursor || data?.next_cursor;
    if (!cursor || busyEarlier) return;
    setBusyEarlier(true);
    try {
      const res = await base44.functions.invoke('manusAgent', { action: 'earlier', task_id: id, cursor });
      setEarlier((prev) => ({
        events: [...(res.data.events || []), ...prev.events],
        cursor: res.data.next_cursor || null,
        hasMore: Boolean(res.data.has_more),
      }));
    } finally {
      setBusyEarlier(false);
    }
  };

  const stop = async () => {
    setStopping(true);
    try {
      await stopTask(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setStopping(false);
    }
  };

  const send = async (message, attachments) => {
    await sendToTask(id, message, attachments, options || {});
    await load();
  };

  if (loading) {
    return (
      <div className="grid h-full place-items-center py-24">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="mx-auto w-full max-w-[820px] px-5 py-16 text-center">
        <p className="text-[13px] text-muted-foreground">{error || 'That task could not be loaded.'}</p>
        <Link to="/library" className="mt-3 inline-block text-[12px] underline underline-offset-4">
          Back to Library
        </Link>
      </div>
    );
  }

  const hasEarlier = earlier.events.length > 0 ? earlier.hasMore : Boolean(data?.has_more);
  const waiting = data?.digest?.waiting;

  const thread = (
    <div className="mx-auto flex h-full w-full max-w-[900px] flex-col px-5 py-6 lg:px-10">
      <div className="shrink-0">
        <Link
          to="/library"
          className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={12} /> Library
        </Link>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2 text-[15px] font-medium leading-snug">
              <span className="truncate">{task.title || 'Untitled task'}</span>
              <StatusPill status={task.status} />
            </h1>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {data?.engine === 'native'
                ? `${modelLabel(task.model)} · ${effortLabel(task.effort)}`
                : String(task.type || 'task').replace('_', ' ')}{' '}
              · created {when(task.created_at)}
              {task.credit_usage ? ` · ${task.credit_usage} credits` : ''}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPanelOpen((open) => !open)}
              aria-pressed={panelOpen}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] transition-colors ${
                panelOpen
                  ? 'border-foreground/20 bg-secondary text-foreground'
                  : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Monitor size={11} /> Computer
              {running && <span className="h-1 w-1 animate-pulse rounded-full bg-info" />}
            </button>
            {running && (
              <button
                type="button"
                onClick={stop}
                disabled={stopping}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
              >
                {stopping ? <Loader2 size={11} className="animate-spin" /> : <Square size={10} />} Stop
              </button>
            )}
            <TaskActions task={task} engine={data?.engine} onError={setError} />
            {task.task_url && (
              <a
                href={task.task_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Open in Manus <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>

        {error && <p className="mt-2 text-[11.5px] text-destructive">{error}</p>}
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto scroll-thin pr-1">
        <DeliverableNote deliverable={task.deliverable} />
        <TaskTimeline
          events={events}
          hasMore={hasEarlier}
          onLoadEarlier={loadEarlier}
          busy={busyEarlier}
        />
        {running && (
          <p className="flex items-center gap-1.5 py-3 text-[11.5px] text-muted-foreground">
            <Loader2 size={11} className="animate-spin" /> The studio is working…
          </p>
        )}
      </div>

      <div className="shrink-0 pt-2">
        <TaskFollowUp
          task={task}
          onSend={send}
          placeholder={waiting?.description || 'Send a follow-up to this task'}
          options={data?.engine === 'native' ? options : null}
          onOptionsChange={data?.engine === 'native' ? setOptions : undefined}
        />
      </div>

    </div>
  );

  if (!isWide) {
    return (
      <div className="h-full">
        {thread}
        <ComputerPanel
          task={task}
          events={events}
          run={data?.run}
          engine={data?.engine}
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-full">
      <ResizablePanelGroup
        key={panelOpen ? 'split' : 'solo'}
        direction="horizontal"
        className="h-full"
      >
        <ResizablePanel minSize={40} className="min-w-0">
          {thread}
        </ResizablePanel>
        {panelOpen && (
          <>
            <ResizableHandle withHandle className="bg-border" />
            <ResizablePanel defaultSize={34} minSize={22} maxSize={55} className="min-w-0">
              <ComputerPane
                task={task}
                events={events}
                run={data?.run}
                engine={data?.engine}
                onClose={() => setPanelOpen(false)}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}