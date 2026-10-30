import React from 'react';
import StatusPill from '@/components/manus/StatusPill';
import { ResultRow, ResultSection } from '@/components/search/ResultSection';
import { prettySize } from '@/lib/files';

const ROWS = {
  tasks: (task) => (
    <ResultRow
      key={task.id}
      to={`/task/${task.id}`}
      title={task.title || 'Untitled task'}
      meta={task.summary || task.instruction}
    >
      <StatusPill status={task.status} />
    </ResultRow>
  ),
  projects: (project) => (
    <ResultRow key={project.id} to={`/studio/${project.id}`} title={project.name} meta={project.client_name || project.description} />
  ),
  websites: (task) => (
    <ResultRow key={task.id} to={`/websites/${task.id}`} title={task.deliverable?.name} meta={task.deliverable?.detail || task.title} />
  ),
  artifacts: (task) => (
    <ResultRow key={task.id} to={`/task/${task.id}`} title={task.deliverable?.name} meta={task.deliverable?.detail || task.title}>
      <span className="shrink-0 rounded-full border border-border px-1.5 py-[1px] text-[10px] capitalize text-muted-foreground">
        {task.deliverable?.type || 'file'}
      </span>
    </ResultRow>
  ),
  files: (file) => (
    <ResultRow
      key={file.id}
      to="/files"
      title={file.name}
      meta={[file.mime_type, file.size ? prettySize(file.size) : ''].filter(Boolean).join(' · ')}
    />
  ),
  agents: (agent) => <ResultRow key={agent.id} to="/agents" title={agent.name} meta={agent.role || agent.instructions} />,
  automations: (automation) => (
    <ResultRow key={automation.id} to="/automations" title={automation.title} meta={automation.instruction} />
  ),
  templates: (template) => (
    <ResultRow key={template.id} to="/templates" title={template.name} meta={template.tagline || template.description} />
  ),
};

export default function SearchResults({ sections, onMore, moreBusy }) {
  return (
    <div className="mt-4 space-y-5">
      {sections
        .filter((section) => section.items.length)
        .map((section) => (
          <ResultSection
            key={section.key}
            title={section.title}
            count={section.items.length}
            hasMore={section.has_more}
            busy={moreBusy === section.key}
            onMore={() => onMore(section.key)}
          >
            {section.items.map(ROWS[section.key])}
          </ResultSection>
        ))}
    </div>
  );
}