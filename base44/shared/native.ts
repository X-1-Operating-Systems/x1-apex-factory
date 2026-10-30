import { loadStudioContext } from './personalization.ts';
import { projectBrief, joinContext } from './projects.ts';
import { loadConnectorSetup } from './connectors.ts';
import { runConnectorTool } from './connectorTools.ts';

const MAX_CONNECTOR_CALLS = 3;

function parseParams(value: any) {
  if (value && typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(String(value || '{}'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export const AI_MODEL = 'gpt_5_6_sol';

export const MODELS = ['gpt_5_6_sol', 'gpt_5_6_luna', 'gpt_5_4', 'claude_sonnet_5', 'gemini_3_1_pro'];
export const EFFORTS = ['standard', 'deep'];

export function pickModel(model: any) {
  return MODELS.includes(String(model)) ? String(model) : AI_MODEL;
}

export function pickEffort(effort: any) {
  return EFFORTS.includes(String(effort)) ? String(effort) : 'standard';
}

const DEPTH = {
  standard: 'Depth: standard. Ship the essential material once, with no padding.',
  deep:
    'Depth: deep. Go further on every section: specifics, quantities, named examples and second-order detail the operator would otherwise have to add.',
};

const TASK_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    steps: { type: 'array', items: { type: 'string' } },
    reply: { type: 'string' },
    deliverable: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string', enum: ['website', 'documents', 'slides', 'spreadsheets', 'images', 'others'] },
        detail: { type: 'string' },
      },
      required: ['name', 'type', 'detail'],
    },
    connector_call: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'connector key, e.g. gmail' },
        tool: { type: 'string', description: 'action id from the connector catalogue' },
        reason: { type: 'string', description: 'why this call is needed' },
        params_json: { type: 'string', description: 'JSON object of the action parameters as a string' },
      },
      required: ['key', 'tool', 'reason', 'params_json'],
    },
  },
  required: ['title', 'summary', 'steps', 'reply'],
};

const SYSTEM = `You are the operator of X1 Apex Factory, an AI studio that plans and ships websites and business deliverables.

For every assignment:
- restate the goal in one line, then work it through end to end. Never ask the operator to do the work for you.
- write the actual deliverable content: real headlines, real section copy, real plan of record. No placeholders, no "insert here".
- keep reply markdown: short paragraphs, a few bolded labels, bullets where they help. Never mention that you are a language model.
- summary is one plain sentence (max 140 characters).
- steps are 3-7 short past-tense lines describing what you did, in order.
- deliverable is what the operator ends up with: name, type and its full content in detail (markdown). Omit it only when the assignment produces no artifact.

The studio's blocks are hero, stats, features, showcase, gallery, pricing, faq, cta, contact, text and footer. When the deliverable is a website, draft it block by block in that vocabulary.`;

export function buildPrompt({ instruction, history = [], followUp = false, effort = 'standard', context = '' }: any) {
  const lines = [SYSTEM, '', DEPTH[pickEffort(effort)], ''];
  if (context) lines.push(context, '');
  if (history.length) {
    lines.push('Conversation so far:');
    for (const message of history.slice(-8)) {
      lines.push(`${message.role === 'user' ? 'Operator' : 'Studio'}: ${String(message.content || '').slice(0, 1500)}`);
    }
    lines.push('');
  }
  lines.push(followUp ? 'New instruction from the operator:' : 'Assignment:', instruction, '');
  lines.push('Return the JSON envelope only.');
  return lines.join('\n');
}

function normalize(envelope: any, fallbackTitle: string) {
  const value = typeof envelope === 'string' ? JSON.parse(envelope) : envelope || {};
  const deliverable = value?.deliverable;
  return {
    title: String(value?.title || fallbackTitle || 'Studio task').slice(0, 120),
    summary: String(value?.summary || '').slice(0, 200),
    steps: Array.isArray(value?.steps) ? value.steps.slice(0, 7).map((step: any) => String(step).slice(0, 400)) : [],
    reply: String(value?.reply || '').slice(0, 12000),
    deliverable:
      deliverable && deliverable.name
        ? {
            name: String(deliverable.name).slice(0, 140),
            type: String(deliverable.type || 'others'),
            detail: String(deliverable.detail || '').slice(0, 20000),
          }
        : null,
  };
}

/**
 * Runs one instruction. When the operator has connectors installed, the model may
 * answer with a connector_call instead of a final envelope; the call is executed
 * server-side inside the allowlist and the real result is handed back to the model.
 */
export async function runInstruction(
  base44: any,
  { instruction, title, history = [], followUp = false, model, effort, context = '', fileUrls = [], userId = '', connections = [] }: any
) {
  const prompt = buildPrompt({ instruction, history, followUp, effort, context });
  const calls: any[] = [];
  let gated = false;

  for (let step = 0; step <= MAX_CONNECTOR_CALLS; step += 1) {
    const canCall = connections.length > 0 && calls.length < MAX_CONNECTOR_CALLS && !gated;
    const transcript = calls.length
      ? ['Connector results so far:', ...calls.map((call, index) => `Call ${index + 1} — ${call.key}.${call.tool}: ${call.status}. ${call.message}`), ''].join('\n')
      : '';
    const closing = canCall
      ? ''
      : gated
        ? 'A connector action was refused by the operator settings and nothing was sent. Return the final JSON envelope now, stating exactly what the operator must change.'
        : 'No further connector calls are available in this run. Return the final JSON envelope now, without connector_call.';

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: [prompt, transcript, closing].filter(Boolean).join('\n'),
      model: pickModel(model),
      response_json_schema: TASK_SCHEMA,
      ...(fileUrls.length ? { file_urls: fileUrls } : {}),
    });

    const requested = result && typeof result === 'object' ? (result as any).connector_call : null;
    if (!canCall || !requested?.key) return { envelope: normalize(result, title), calls };

    const signature = `${requested.key}.${requested.tool}.${String(requested.params_json || '')}`;
    const repeated = calls.some((call) => call.signature === signature);
    if (repeated) {
      return {
        envelope: normalize(null, title),
        calls: [
          ...calls,
          {
            key: String(requested.key),
            tool: String(requested.tool),
            status: 'error',
            message: 'That exact call was already attempted and did not succeed, so it was not repeated. Report what happened to the operator.',
            signature,
          },
        ],
      };
    }

    const connection = connections.find((entry: any) => entry.key === String(requested.key));
    const hit = await runConnectorTool(base44, {
      userId,
      key: requested.key,
      tool: requested.tool,
      params: parseParams(requested.params_json),
      access: connection?.access,
      autoApprove: connection?.autoApprove,
      connected: Boolean(connection?.connected),
    });
    calls.push({ ...hit, signature, reason: String(requested.reason || '').slice(0, 300) });
    if (hit.status === 'gated') gated = true;
  }

  return { envelope: normalize(null, title), calls };
}

export function userEvent(content: string, attachments: any[] = []) {
  return {
    role: 'user',
    content: String(content).slice(0, 6000),
    ts: Date.now(),
    ...(attachments.length ? { attachments } : {}),
  };
}

export async function saveAttachments(base44: any, attachments: any[] = []) {
  const saved: any[] = [];
  for (const file of attachments.slice(0, 5)) {
    if (!file?.file_uri) continue;
    const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
      file_uri: file.file_uri,
      expires_in: 3600,
    }).catch(() => null);
    saved.push({
      name: String(file.name || 'File').slice(0, 160),
      file_uri: file.file_uri,
      mime_type: file.mime_type || '',
      url: signed?.signed_url || '',
    });
  }
  return saved;
}

export async function loadProjectFiles(base44: any, projectId: any) {
  const id = String(projectId || '').trim();
  if (!id) return [];
  const { items } = await base44.asServiceRole.entities.StudioFile
    .filter({ project_id: id }, { sort: '-created_date', limit: 4 })
    .catch(() => ({ items: [] }));
  return saveAttachments(
    base44,
    items.map((file: any) => ({ name: file.name, file_uri: file.file_uri, mime_type: file.mime_type }))
  );
}

export function outputEvents(out: any) {
  const now = Date.now();
  const events: any[] = out.steps.map((step: string) => ({ role: 'agent', content: step, ts: now }));
  if (out.reply) events.push({ role: 'assistant', content: out.reply, ts: now });
  return events;
}

export function toolEvents(calls: any[] = []) {
  const now = Date.now();
  return calls.map((call) => ({
    role: 'tool',
    content: `${call.key}.${call.tool} → ${call.status}${call.reason ? ` (${call.reason})` : ''}: ${call.message}`.slice(0, 2000),
    ts: now,
  }));
}

export function errorEvent(message: string) {
  return { role: 'error', content: String(message || 'The run failed.').slice(0, 600), ts: Date.now() };
}

export async function createNativeTask(base44: any, { userId, title, instruction, agentId = '', model, effort, attachments = [], projectId = '', automationId = '' }: any) {
  const chosenModel = pickModel(model);
  const chosenEffort = pickEffort(effort);
  const files = [
    ...(await saveAttachments(base44, attachments)),
    ...(await loadProjectFiles(base44, projectId)),
  ];

  const record = await base44.asServiceRole.entities.StudioTask.create({
    created_by_id: userId,
    title: String(title || instruction).slice(0, 120),
    instruction: String(instruction).slice(0, 6000),
    project_id: String(projectId || ''),
    automation_id: String(automationId || ''),
    status: 'running',
    engine: 'native',
    model: chosenModel,
    effort: chosenEffort,
    agent_id: agentId || '',
    events: [userEvent(instruction, files)],
  });

  try {
    const setup = await loadConnectorSetup(base44, userId);
    const context = joinContext(
      await projectBrief(base44, projectId),
      joinContext(await loadStudioContext(base44, userId), setup.context)
    );
    const run = await runInstruction(base44, {
      instruction,
      title,
      model: chosenModel,
      effort: chosenEffort,
      context,
      userId,
      connections: setup.connections,
      fileUrls: files.map((f: any) => f.url).filter(Boolean),
    });
    const out = run.envelope;
    return await base44.asServiceRole.entities.StudioTask.update(record.id, {
      title: out.title || record.title,
      status: 'stopped',
      summary: out.summary,
      events: [...record.events, ...toolEvents(run.calls), ...outputEvents(out)],
      deliverable: out.deliverable,
    });
  } catch (error: any) {
    return await base44.asServiceRole.entities.StudioTask.update(record.id, {
      status: 'error',
      events: [...record.events, errorEvent(error?.message)],
    });
  }
}

export async function followUpNativeTask(base44: any, { task, message, model, effort, attachments = [] }: any) {
  const history = (task.events || [])
    .filter((event: any) => event.role === 'user' || event.role === 'assistant')
    .map((event: any) => ({ role: event.role, content: event.content }));

  const files = await saveAttachments(base44, attachments);
  const projectFiles = await loadProjectFiles(base44, task.project_id);
  const withMessage = [...(task.events || []), userEvent(message, files)];

  try {
    const setup = await loadConnectorSetup(base44, task.created_by_id);
    const context = joinContext(
      await projectBrief(base44, task.project_id),
      joinContext(await loadStudioContext(base44, task.created_by_id), setup.context)
    );
    const run = await runInstruction(base44, {
      instruction: message,
      title: task.title,
      history,
      followUp: true,
      model: model || task.model,
      effort: effort || task.effort,
      context,
      userId: task.created_by_id,
      connections: setup.connections,
      fileUrls: [...files, ...projectFiles].map((f: any) => f.url).filter(Boolean).slice(0, 6),
    });
    const out = run.envelope;
    return await base44.asServiceRole.entities.StudioTask.update(task.id, {
      status: 'stopped',
      summary: out.summary || task.summary,
      events: [...withMessage, ...toolEvents(run.calls), ...outputEvents(out)],
      deliverable: out.deliverable || task.deliverable,
    });
  } catch (error: any) {
    return await base44.asServiceRole.entities.StudioTask.update(task.id, {
      status: 'error',
      events: [...withMessage, errorEvent(error?.message)],
    });
  }
}