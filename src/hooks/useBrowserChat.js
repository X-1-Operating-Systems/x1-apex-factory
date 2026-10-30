import { useCallback, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

const TERMINAL = ['COMPLETED', 'FAILED', 'STOPPED', 'CANCELLED', 'TIMED_OUT', 'ERROR', 'SUCCEEDED'];

const isTerminal = (status) => TERMINAL.includes(String(status || '').toUpperCase());

export default function useBrowserChat() {
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const history = useRef([]);
  const seq = useRef(0);

  const add = useCallback((message) => {
    seq.current += 1;
    const entry = { id: `m${seq.current}`, ...message };
    setMessages((prev) => [...prev, entry]);
    return entry.id;
  }, []);

  const patch = useCallback((id, changes) => {
    setMessages((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }, []);

  const pollRun = useCallback(
    async (id, runId) => {
      for (let attempt = 0; attempt < 45; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        const res = await base44.functions.invoke('browserbase', {
          action: 'runs.get',
          params: { run_id: runId },
        });
        const payload = res.data || {};
        patch(id, { result: payload, state: 'done' });
        const status = payload.data && (payload.data.status || payload.data.state);
        if (!payload.ok || isTerminal(status)) return payload;
      }
      return null;
    },
    [patch]
  );

  const run = useCallback(
    async (action, params, label, confirm) => {
      const id = add({ role: 'tool', action, params, label, state: 'running' });
      setBusy(true);
      setError(null);
      try {
        const res = await base44.functions.invoke('browserbase', {
          action,
          params: params || {},
          confirm: confirm === true,
        });
        const payload = res.data || {};
        patch(id, { state: 'done', result: payload });
        history.current.push({
          role: 'assistant',
          content: `${action} ${payload.ok ? 'succeeded' : `failed: ${payload.error || 'unknown error'}`}`,
        });
        // a resumed run is live again, so it needs the same polling a fresh one gets
        if ((action === 'runs.create' || action === 'runs.resume') && payload.ok) {
          const runId = (payload.data && (payload.data.runId || payload.data.id)) || null;
          if (runId) await pollRun(id, runId);
        }
        return payload;
      } catch (invokeError) {
        patch(id, { state: 'done', result: { ok: false, error: invokeError.message } });
        setError(invokeError.message);
        return null;
      } finally {
        setBusy(false);
      }
    },
    [add, patch, pollRun]
  );

  const send = useCallback(
    async (text) => {
      const value = (text || '').trim();
      if (!value || busy) return;
      add({ role: 'user', text: value });
      history.current.push({ role: 'user', content: value });
      setBusy(true);
      setError(null);
      try {
        const res = await base44.functions.invoke('browserbaseChat', {
          message: value,
          history: history.current.slice(-8),
        });
        const plan = res.data || {};
        if (plan.error) throw new Error(plan.error);
        if (plan.reply) {
          add({ role: 'assistant', text: plan.reply });
          history.current.push({ role: 'assistant', content: plan.reply });
        }
        if (plan.action && plan.needs_confirmation) {
          add({ role: 'confirm', action: plan.action, params: plan.params, summary: plan.summary });
        } else if (plan.action) {
          await run(plan.action, plan.params, plan.summary, false);
        }
      } catch (resolveError) {
        setError(resolveError.message);
        add({ role: 'assistant', text: `The control plane could not resolve that: ${resolveError.message}` });
      } finally {
        setBusy(false);
      }
    },
    [add, busy, run]
  );

  const confirm = useCallback(
    async (id, action, params) => {
      patch(id, { resolved: true });
      await run(action, params, 'Confirmed', true);
    },
    [patch, run]
  );

  const cancel = useCallback(
    (id) => {
      patch(id, { resolved: true });
      add({ role: 'assistant', text: 'Cancelled. Nothing was run.' });
    },
    [add, patch]
  );

  const reset = useCallback(() => {
    setMessages([]);
    history.current = [];
    setError(null);
  }, []);

  return { messages, busy, error, send, confirm, cancel, reset, run };
}