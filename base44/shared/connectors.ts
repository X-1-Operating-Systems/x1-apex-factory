import { CONNECTOR_SPECS, toolCatalogue } from './connectorTools.ts';

const CONNECTOR_CAP = 10;

const ACCESS_LABEL: any = {
  read: 'read-only',
  read_write: 'read and write',
  full: 'full access',
};

export type ConnectorSetup = {
  /** Prompt block naming the installer's connectors and the exact actions a run may take. */
  context: string;
  /** What the executor needs: access level, approval gate and available actions. */
  connections: any[];
};

/**
 * Reads the operator's installed connectors and declares to the engine exactly
 * which actions it may call. Any connector without an allowlist entry is declared
 * as plan-only, so the engine never claims work it cannot perform.
 */
export async function loadConnectorSetup(base44: any, userId: string): Promise<ConnectorSetup> {
  if (!userId) return { context: '', connections: [] };

  try {
    const list = await base44.asServiceRole.entities.StudioConnector.filter({ created_by_id: userId });
    const active = (list || []).slice(0, CONNECTOR_CAP);
    if (!active.length) return { context: '', connections: [] };

    const connections: any[] = [];
    const lines = ['Connectors this operator has installed (their own accounts):'];

    for (const connector of active) {
      const key = String(connector.key || '');
      const spec = CONNECTOR_SPECS[key];
      const access = ACCESS_LABEL[connector.access] || 'read and write';
      const gate = connector.auto_approve ? 'auto-approved' : 'writes need the operator to approve on the Connectors page';
      lines.push(`- ${connector.name || spec?.label || key} [key: ${key}] — ${access}, ${gate}.`);

      if (!spec) {
        lines.push('    No runnable action is wired for this connector yet: it is plan-only.');
        continue;
      }

      lines.push('    Runnable actions:');
      lines.push(toolCatalogue(key));
      connections.push({
        key,
        name: connector.name || spec.label,
        access: connector.access || 'read_write',
        autoApprove: Boolean(connector.auto_approve),
        connected: Boolean(connector.installed_at),
      });
    }

    lines.push(
      'To use one, return a connector_call instead of a final answer: {"key":"<key>","tool":"<action id>","reason":"<why>","params_json":"{\\"param\\":\\"value\\"}"}. You get the real result back and then answer. One call per turn, at most three per run.',
      'A gated or failed call means nothing happened. Say plainly what the operator must change, and never state or imply that an action was taken when the result says otherwise.',
      ''
    );

    return { context: lines.join('\n'), connections };
  } catch {
    return { context: '', connections: [] };
  }
}