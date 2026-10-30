import { base44 } from '@/api/base44Client';

export const AI_MODEL = 'gpt_5_6_sol';

let cached = null;

async function manusReady() {
  const res = await base44.functions.invoke('manusAgent', { action: 'account' }).catch(() => null);
  return Boolean(res?.data?.ready);
}

export async function engineInfo() {
  if (cached) return cached;
  const me = await base44.auth.me().catch(() => null);
  const preferred = me?.engine === 'manus' ? 'manus' : 'native';
  const ready = preferred === 'manus' ? await manusReady() : false;
  cached = { engine: preferred === 'manus' && ready ? 'manus' : 'native', preferred, manusReady: ready };
  return cached;
}

export async function setEngine(engine) {
  await base44.auth.updateMe({ engine: engine === 'manus' ? 'manus' : 'native' });
  cached = null;
  return engineInfo();
}

export async function createTask({ title, instruction, agent_id, model, effort }) {
  const { engine } = await engineInfo();
  const fn = engine === 'manus' ? 'manusAgent' : 'nativeTask';
  const res = await base44.functions.invoke(fn, { action: 'create', title, instruction, agent_id, model, effort });
  return { ...res.data, engine };
}

export async function listTasks({ limit = 40 } = {}) {
  const nativeRes = await base44.functions.invoke('nativeTask', { action: 'list', limit }).catch(() => null);
  const native = (nativeRes?.data?.tasks || []).map((task) => ({ ...task, engine: 'native' }));

  if (await manusReady()) {
    const res = await base44.functions.invoke('manusAgent', { action: 'tasks', limit }).catch(() => null);
    if (res) {
      return {
        tasks: [...native, ...(res.data.tasks || []).map((task) => ({ ...task, engine: 'manus' }))],
        next_cursor: res.data.next_cursor || null,
        has_more: Boolean(res.data.has_more),
      };
    }
  }

  return { tasks: native, next_cursor: null, has_more: false };
}

export async function moreTasks(cursor) {
  const res = await base44.functions.invoke('manusAgent', { action: 'tasks', limit: 40, cursor });
  return {
    tasks: (res.data.tasks || []).map((task) => ({ ...task, engine: 'manus' })),
    next_cursor: res.data.next_cursor || null,
    has_more: Boolean(res.data.has_more),
  };
}

const ORDER = ['nativeTask', 'manusAgent'];

export async function taskDetail(id) {
  const { engine } = await engineInfo();
  const order = engine === 'manus' ? [...ORDER].reverse() : ORDER;
  let lastError;
  for (const fn of order) {
    try {
      const res = await base44.functions.invoke(fn, { action: 'detail', task_id: id });
      return { ...res.data, engine: fn === 'manusAgent' ? 'manus' : 'native' };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export async function sendToTask(id, message, attachments, options = {}) {
  const { engine } = await engineInfo();
  const fn = engine === 'manus' ? 'manusAgent' : 'nativeTask';
  const payload = { action: 'send', task_id: id, message, attachments, model: options.model, effort: options.effort };
  try {
    return await base44.functions.invoke(fn, payload);
  } catch (err) {
    const other = fn === 'manusAgent' ? 'nativeTask' : 'manusAgent';
    return base44.functions.invoke(other, payload);
  }
}

export async function stopTask(id) {
  const { engine } = await engineInfo();
  const fn = engine === 'manus' ? 'manusAgent' : 'nativeTask';
  try {
    return await base44.functions.invoke(fn, { action: 'stop', task_id: id });
  } catch (err) {
    return null;
  }
}

export async function listArtifacts({ type = 'all', limit = 24, cursor } = {}) {
  const nativeRes = await base44.functions.invoke('nativeTask', { action: 'artifacts', type, limit }).catch(() => null);
  const native = nativeRes?.data?.artifacts || [];

  if (cursor || (await manusReady())) {
    const res = await base44.functions.invoke('manusAgent', { action: 'artifacts', type, limit, cursor }).catch(() => null);
    if (res) {
      return {
        artifacts: cursor ? res.data.artifacts || [] : [...native, ...(res.data.artifacts || [])],
        next_cursor: res.data.next_cursor || null,
        has_more: Boolean(res.data.has_more),
      };
    }
  }

  return { artifacts: native, next_cursor: null, has_more: false };
}