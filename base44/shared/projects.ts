export async function projectBrief(base44: any, projectId: any) {
  const id = String(projectId || '').trim();
  if (!id) return '';
  const project = await base44.asServiceRole.entities.Project.get(id).catch(() => null);
  if (!project) return '';
  const lines: string[] = [`Project: ${project.name || 'Untitled project'}`];
  if (project.client_name) lines.push(`Client: ${project.client_name}`);
  if (project.master_instruction) {
    lines.push(`Project master instruction (always apply): ${String(project.master_instruction).slice(0, 2000)}`);
  }
  return lines.length > 1 ? lines.join('\n') : '';
}

export function joinContext(...parts: any[]) {
  return parts.map((part) => String(part || '').trim()).filter(Boolean).join('\n\n');
}