import { useCallback, useEffect, useState } from 'react';
import { createTask, sendToTask, taskDetail } from '@/lib/taskEngine';

const ACTIVE = ['running', 'waiting'];

export default function useStudioChat({ projectId = '', model = 'gpt_5_6_sol', effort = 'standard' } = {}) {
  const [taskId, setTaskId] = useState('');
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!taskId) return undefined;
    let live = true;
    let timer = null;
    const load = async () => {
      const res = await taskDetail(taskId).catch(() => null);
      if (!live || !res) return;
      setData(res);
      const active = ACTIVE.includes(res?.task?.status);
      setBusy(active);
      if (!active && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    load();
    timer = setInterval(load, 3500);
    return () => {
      live = false;
      if (timer) clearInterval(timer);
    };
  }, [taskId, pulse]);

  const reset = useCallback(() => {
    setTaskId('');
    setData(null);
    setError('');
    setBusy(false);
  }, []);

  const send = useCallback(
    async (text, attachments = []) => {
      const instruction = String(text || '').trim();
      if (!instruction && !attachments.length) return;
      setError('');
      setBusy(true);
      try {
        if (!taskId) {
          const res = await createTask({
            title: instruction.slice(0, 70) || 'Studio request',
            instruction,
            model,
            effort,
            project_id: projectId,
            attachments,
          });
          setTaskId(res.task_id);
        } else {
          await sendToTask(taskId, instruction, attachments, { model, effort });
        }
        setPulse((value) => value + 1);
      } catch (err) {
        setError(err?.response?.data?.error || err.message);
        setBusy(false);
      }
    },
    [taskId, model, effort, projectId]
  );

  return {
    taskId,
    task: data?.task || null,
    events: data?.events || [],
    engine: data?.engine,
    busy,
    error,
    send,
    reset,
  };
}