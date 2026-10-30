import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Monitor, Square } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatusPill from '@/components/manus/StatusPill';
import TaskTimeline from '@/components/task/TaskTimeline';
import TaskFollowUp from '@/components/task/TaskFollowUp';
import ComputerPanel from '@/components/task/ComputerPanel';
import DeliverableNote from '@/components/task/DeliverableNote';
import { taskDetail, stopTask, sendToTask } from '@/lib/taskEngine';

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
    await sendToTask(id, message, attachments);
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

  return (
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
              {task.type.replace('_', ' ')} · created {when(task.created_at)}
              {task.credit_usage ? ` · ${task.credit_usage} credits` : ''}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {data?.engine !== 'native' && (
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Monitor size={11} /> Computer
                {running && <span className="h-1 w-1 rounded-full bg-info" />}
              </button>
            )}
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
          onSend={send}
          placeholder={waiting?.description || 'Send a follow-up to this task'}
        />
      </div>

      <ComputerPanel run={data?.run} open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
}