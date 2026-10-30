const SKILL_CAP = 12;
const MEMORY_CAP = 10;

export async function loadStudioContext(base44: any, userId: string) {
  if (!userId) return '';

  const lines: string[] = [];

  try {
    const prefs = await base44.asServiceRole.entities.StudioPreference.filter({ created_by_id: userId });
    const pref = (prefs || [])[0];
    const standing = String(pref?.personal_instructions || '').trim();
    if (standing) {
      lines.push('Operator standing instructions (always apply):', standing, '');
    }
    const memory = Array.isArray(pref?.memory) ? pref.memory.slice(-MEMORY_CAP) : [];
    const facts = memory
      .map((item: any) => (typeof item === 'string' ? item : item?.text))
      .filter((text: any) => String(text || '').trim());
    if (facts.length) {
      lines.push('Remembered about this operator:');
      for (const fact of facts) lines.push(`- ${String(fact).slice(0, 400)}`);
      lines.push('');
    }
  } catch {
    // personalization is optional context; a failed read must not stop a run
  }

  try {
    const skills = await base44.asServiceRole.entities.StudioSkill.filter({ created_by_id: userId, enabled: true });
    const active = (skills || []).slice(0, SKILL_CAP);
    if (active.length) {
      lines.push('Skills to apply on every run:');
      for (const skill of active) {
        lines.push(`- ${skill.name}: ${String(skill.instructions || '').slice(0, 600)}`);
      }
      lines.push('');
    }
  } catch {
    // same: skills are additive context only
  }

  return lines.join('\n').trim();
}