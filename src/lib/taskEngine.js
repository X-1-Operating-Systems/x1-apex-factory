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

export async function createTask({ title, instruction, agent_id, model, effort, project_id, attachments = [] }) {
  const { engine } = await engineInfo();
  const fn = engine === 'manus' ? 'manusAgent' : 'nativeTask';
  const res = await base44.functions.invoke(fn, {
    action: 'create',
    title,
    instruction,
    agent_id,
    model,
    effort,
    attachments,
    project_id: project_id || '',
  });
  return { ...res.data, engine };
}

/**
 * One page of tasks across both engines.
 * `cursors` null = first page; otherwise only the engines that still have a
 * cursor are queried, so "load more" never refetches what is already on screen.
 * Native tasks filter and page on the server; Manus exposes no filters, so its
 * page is narrowed by the same status/query inside this call.
 */
export async function listTasks({ limit = 40, status = 'all', query = '', cursors = null } = {}) {
  const search = String(query || '').trim();
  const term = search.toLowerCase();
  const wantNative = !cursors || Boolean(cursors.native);
  const wantManus = cursors ? Boolean(cursors.manus) : await manusReady();

  const tasks = [];
  let nativeCursor = null;
  let nativeHasMore = false;
  let manusCursor = null;
  let manusHasMore = false;

  if (wantNative) {
    const payload = { action: 'list', limit, status, query: search };
    if (cursors?.native) payload.cursor = cursors.native;
    const res = await base44.functions.invoke('nativeTask', payload).catch(() => null);
    (res?.data?.tasks || []).forEach((task) => tasks.push({ ...task, engine: 'native' }));
    nativeCursor = res?.data?.next_cursor || null;
    nativeHasMore = Boolean(res?.data?.has_more);
  }

  if (wantManus) {
    const res = await base44.functions
      .invoke('manusAgent', { action: 'tasks', limit: 60, ...(cursors?.manus ? { cursor: cursors.manus } : {}) })
      .catch(() => null);
    if (res) {
      (res.data.tasks || [])
        .map((task) => ({ ...task, engine: 'manus' }))
        .filter((task) => status === 'all' || task.status === status)
        .filter((task) => !term || String(task.title || '').toLowerCase().includes(term))
        .forEach((task) => tasks.push(task));
      manusCursor = res.data.next_cursor || null;
      manusHasMore = Boolean(res.data.has_more);
    }
  }

  return {
    tasks,
    native_cursor: nativeCursor,
    manus_cursor: manusCursor,
    has_more: nativeHasMore || manusHasMore,
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

/** Starts a fresh run from a task's own brief, model and effort. */
export async function rerunTask(task) {
  const res = await base44.functions.invoke('nativeTask', {
    action: 'create',
    title: task.title,
    instruction: task.instruction || '',
    model: task.model,
    effort: task.effort,
    project_id: task.project_id || '',
  });
  return res.data;
}

export async function deleteTask(id) {
  await base44.entities.StudioTask.delete(id);
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