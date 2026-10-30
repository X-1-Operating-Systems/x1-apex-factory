import { secrets } from 'base44:runtime';

const BASE = 'https://api.manus.ai';

export async function manusCall(path: string, options: any = {}) {
  const { method = 'GET', query, body } = options;
  const key = secrets.get('MANUS_API_KEY');
  if (!key) throw Object.assign(new Error('MANUS_API_KEY is not configured.'), { status: 500 });

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