const CONNECTOR_CAP = 10;

const ACCESS_LABEL: any = {
  read: 'read-only',
  read_write: 'read and write',
  full: 'full access',
};

/**
 * Declares the operator's configured connectors to the reasoning engine.
 * The engine cannot call a connector itself, so the block is explicit about that:
 * it plans and writes the exact action, and never claims one was performed.
 */
export async function loadConnectorContext(base44: any, userId: string) {
  if (!userId) return '';

  try {
    const list = await base44.asServiceRole.entities.StudioConnector.filter({ created_by_id: userId });
    const active = (list || []).slice(0, CONNECTOR_CAP);
    if (!active.length) return '';

    const lines = [
      'Connectors configured for this operator (their own accounts, connected to the app):',
    ];
    for (const connector of active) {
      const access = ACCESS_LABEL[connector.access] || 'read and write';
      const gate = connector.auto_approve ? 'auto-approved' : 'needs the operator to approve each action';
      lines.push(`- ${connector.name}${connector.category ? ` (${connector.category})` : ''}: ${access}, ${gate}.`);
    }
    lines.push(
      'You cannot call a connector from a run. When the assignment needs one, write the exact action and the payload the operator should send there, and never state or imply that an action was already taken in it.',
      ''
    );
    return lines.join('\n');
  } catch {
    return '';
  }
}