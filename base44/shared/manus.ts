import { secrets } from 'base44:runtime';

const BASE = 'https://api.manus.ai';

// Each operator's own key wins; the workspace key is the fallback.
export async function resolveUserKey(base44: any, userId: string) {
  const page = await base44.asServiceRole.entities.ManusAccount.filter(
    { created_by_id: userId },
    { sort: '-created_date', limit: 1 }
  );
  const row = page.items?.[0];
  if (row?.api_key && row.status !== 'invalid') {
    return { key: row.api_key, source: 'personal', hint: row.hint || '' };
  }
  const shared = secrets.get('MANUS_API_KEY');
  return { key: shared || null, source: shared ? 'workspace' : 'none', hint: row?.hint || '' };
}

export const keyHint = (key: string) => `••••${String(key).slice(-4)}`;

// Cheapest authenticated call Manus offers — proves a key before we store it.
export async function verifyKey(key: string) {
  await manusCall('/v2/task.list', { query: { limit: 1 }, apiKey: key });
}

export async function manusCall(path: string, options: any = {}) {
  const { method = 'GET', query, body, apiKey } = options;
  const key = apiKey || secrets.get('MANUS_API_KEY');
  if (!key) throw Object.assign(new Error('Connect a Manus API key to start working.'), { status: 400 });

  const url = new URL(`${BASE}${path}`);
  Object.entries(query || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json', 'x-manus-api-key': key },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(25000),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    const message = data?.error?.message || `Manus request failed (${res.status}).`;
    throw Object.assign(new Error(message), { status: res.status >= 400 && res.status < 500 ? 400 : 502 });
  }
  return data;
}

const asText = (value: any): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && typeof value.content === 'string') return value.content;
  return '';
};

const asFiles = (list: any[]) =>
  (list || [])
    .filter((file) => file?.url)
    .map((file) => ({
      name: String(file.filename || 'Attachment').slice(0, 120),
      url: String(file.url),
      path: file.path ? String(file.path) : '',
    }));

// Manus returns execution-environment paths and non-HTTP links in message text.
// Swap matched file paths for their download URL and drop unsupported protocols.
export function resolveLinks(content: string, files: any[]) {
  let text = String(content || '');

  for (const file of files || []) {
    if (!file.path) continue;
    const encoded = encodeURI(file.path);
    for (const needle of new Set([file.path, encoded])) {
      text = text.split(`](${needle})`).join(`](${file.url})`);
    }
  }

  return text.replace(/\[([^\]]*)\]\((?!https?:\/\/)([^)]*)\)/g, '$1');
}

// The agent's computer view: latest plan snapshot, current activity, tool actions.
export function summarizeRun(messages: any[]) {
  const ordered = [...(messages || [])];

  const planEvent = ordered.find(
    (event) => event?.type === 'plan_update' && Array.isArray(event?.plan_update?.steps) && event.plan_update.steps.length
  );
  const steps = planEvent
    ? planEvent.plan_update.steps.slice(0, 24).map((step: any) => ({
        title: String(step?.title || '').slice(0, 160),
        status: String(step?.status || 'todo'),
      }))
    : [];

  const statusEvent = ordered.find((event) => event?.type === 'status_update');
  const status = statusEvent?.status_update || {};

  const activity = ordered
    .filter((event) => event?.type === 'tool_used')
    .slice(0, 40)
    .map((event: any) => ({
      id: String(event?.id || ''),
      tool: String(event?.tool_used?.tool || 'tool'),
      status: String(event?.tool_used?.status || 'success'),
      brief: String(event?.tool_used?.message?.action || event?.tool_used?.brief || '').slice(0, 180),
      detail: String(event?.tool_used?.description || '').slice(0, 400),
      timestamp: Number(event?.timestamp || 0),
    }));

  return {
    steps,
    activity,
    agent_status: String(status?.agent_status || ''),
    brief: String(status?.brief || '').slice(0, 300),
    description: String(status?.description || '').slice(0, 600),
    waiting: String(status?.status_detail?.waiting_description || '').slice(0, 400),
  };
}

export function buildContent(text: string, files: any[]) {
  const usable = (files || []).slice(0, 5);
  if (!usable.length) return text;
  const parts: any[] = [];
  if (text) parts.push({ type: 'text', text });
  for (const file of usable) {
    parts.push({
      type: 'file',
      file_url: file.url,
      filename: file.name,
      ...(file.type ? { mime_type: file.type } : {}),
    });
  }
  return parts;
}

export function normalizeEvents(messages: any[]) {
  const ordered = [...(messages || [])].reverse();
  return ordered
    .map((event: any) => {
      const base = {
        id: String(event?.id || ''),
        type: String(event?.type || ''),
        timestamp: Number(event?.timestamp || 0),
      };
      const type = base.type;

      if (type === 'user_message') {
        const message = event.user_message || {};
        return { ...base, role: 'user', content: asText(message.content).slice(0, 4000), attachments: asFiles(message.attachments) };
      }
      if (type === 'assistant_message') {
        const message = event.assistant_message || {};
        return {
          ...base,
          role: 'assistant',
          content: resolveLinks(asText(message.content), asFiles(message.attachments)).slice(0, 6000),
          attachments: asFiles(message.attachments),
          options: (message.question_expectation?.options || []).slice(0, 6).map((o: any) => String(o).slice(0, 120)),
        };
      }
      if (type === 'tool_used') {
        const tool = event.tool_used || {};
        return { ...base, role: 'agent', content: String(tool.brief || tool.description || tool.tool || 'Worked on a step').slice(0, 200), attachments: [] };
      }
      if (type === 'error_message') {
        return { ...base, role: 'error', content: String(event.error_message?.content || 'The task failed.').slice(0, 400), attachments: [] };
      }
      if (type === 'user_stop') {
        return { ...base, role: 'system', content: 'Task stopped.', attachments: [] };
      }
      if (type === 'explanation') {
        return { ...base, role: 'agent', content: asText(event.explanation?.content || event.explanation).slice(0, 600), attachments: [] };
      }
      if (type === 'new_plan_step') {
        return { ...base, role: 'agent', content: String(event.new_plan_step?.title || event.new_plan_step?.description || '').slice(0, 200), attachments: [] };
      }
      return { ...base, role: 'system', content: '', attachments: [] };
    })
    .filter((event) => event.role !== 'system' || event.content);
}

export function digestTask(messages: any[]) {
  const ordered = [...(messages || [])].reverse();
  let agentStatus = 'running';
  let waiting: any = null;
  let answer = '';
  let error = '';
  const steps: string[] = [];
  const artifacts: any[] = [];

  for (const event of ordered) {
    const type = event?.type;
    if (type === 'status_update') {
      const update = event.status_update || {};
      agentStatus = update.agent_status || agentStatus;
      const detail = update.status_detail;
      if (agentStatus === 'waiting' && detail) {
        waiting = {
          type: detail.waiting_for_event_type || 'input',
          description: String(detail.waiting_description || '').slice(0, 400),
          eventId: detail.waiting_for_event_id || '',
        };
      }
    }
    if (type === 'assistant_message') {
      const message = event.assistant_message || {};
      if (message.content) answer = String(message.content).slice(0, 6000);
      for (const file of message.attachments || []) {
        if (file?.url) artifacts.push({ name: String(file.filename || 'Attachment').slice(0, 120), url: file.url });
      }
      const expectation = message.question_expectation;
      if (expectation?.options?.length) {
        waiting = {
          type: 'question',
          description: String(message.content || '').slice(0, 400),
          options: expectation.options.slice(0, 6).map((o: any) => String(o).slice(0, 120)),
          eventId: event.id || '',
        };
      }
    }
    if (type === 'tool_used') {
      const tool = event.tool_used || {};
      const brief = tool.brief || tool.description || tool.tool;
      if (brief) steps.push(String(brief).slice(0, 140));
    }
    if (type === 'error_message') {
      error = String(event.error_message?.content || 'The task failed.').slice(0, 400);
    }
  }

  const finished = agentStatus === 'stopped' || agentStatus === 'error';

  return {
    agentStatus,
    finished,
    waiting,
    answer,
    error,
    steps: steps.slice(-6),
    artifacts: artifacts.slice(0, 8),
  };
}