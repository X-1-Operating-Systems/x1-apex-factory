import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  GUARDRAILS,
  actionExists,
  actionSummary,
  isDestructive,
  listActions,
} from '../../shared/browserbase.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

    const payload = await req.json().catch(() => ({}));
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';
    if (!message) return Response.json({ error: 'message is required' }, { status: 400 });

    const registry = listActions();
    const actionLines = registry.map((item) => `- ${item.name} [${item.kind}] ${item.summary}`).join('\n');

    const history = Array.isArray(payload.history) ? payload.history.slice(-8) : [];
    const conversation = history
      .filter((entry) => entry && typeof entry.content === 'string' && entry.content.trim())
      .map((entry) => `${entry.role === 'user' ? 'Operator' : 'Control plane'}: ${entry.content}`)
      .join('\n');

    const prompt = `You are the command resolver for the X1 Apex Factory control plane. You never chat freely and never explain capabilities: you map one operator message onto exactly one Browserbase action from the registry, with typed parameters, or onto no action when the message is conversation only.

REGISTRY — the only actions that exist:
${actionLines}

RULES
1. action is one exact registry name, or an empty string when the message is not a Browserbase operation or cannot be mapped.
2. params contains only the keys that action's summary names. Never invent a session id, run id, agent id, context id or webhook id; if one is required and missing, leave action empty and ask for it.
3. needs_confirmation is true only for a [destructive] action.
4. If the request is ambiguous, keep action empty, ask exactly one short disambiguating line in reply, and name what is missing in summary.
5. Guardrails when choosing parameters: session timeout defaults to ${GUARDRAILS.maxSessionSeconds} seconds and can never exceed ${GUARDRAILS.hardCapSeconds} seconds; at most ${GUARDRAILS.maxConcurrentSessions} sessions run at once.
6. reply is one or two plain sentences for the operator. No markdown, no lists, no emoji.
7. summary is one short line of what will run, for example "Open a session with recording and logs on".

${conversation ? `Conversation so far:\n${conversation}\n\n` : ''}Operator message: ${message}`;

    const plan = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          reply: { type: 'string' },
          action: { type: 'string' },
          params: { type: 'object' },
          needs_confirmation: { type: 'boolean' },
          summary: { type: 'string' },
        },
        required: ['reply', 'action', 'params', 'needs_confirmation', 'summary'],
        additionalProperties: false,
      },
    });

    const chosen = plan && typeof plan.action === 'string' && actionExists(plan.action) ? plan.action : '';
    const params = plan && plan.params && typeof plan.params === 'object' && !Array.isArray(plan.params) ? plan.params : {};

    return Response.json({
      ok: true,
      reply: (plan && plan.reply) || (chosen ? 'Ready.' : 'Which Browserbase operation do you want?'),
      action: chosen,
      params,
      needs_confirmation: chosen ? isDestructive(chosen) : false,
      summary: (plan && plan.summary) || (chosen ? actionSummary(chosen) : ''),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}