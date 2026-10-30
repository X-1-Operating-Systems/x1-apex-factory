import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search as SearchIcon, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatusPill from '@/components/manus/StatusPill';
import { ResultRow, ResultSection } from '@/components/search/ResultSection';
import AIChat from '@/components/ai/AIChat';
import useStudioChat from '@/hooks/useStudioChat';
import { loadTaskOptions, saveTaskOptions } from '@/lib/taskOptions';
import { prettySize } from '@/lib/files';

const like = (value) => ({ $regex: value, $options: 'i' });
const artifactMatch = (query) => ({
  $or: [{ 'deliverable.name': like(query) }, { 'deliverable.detail': like(query) }],
});

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') || '');
  const query = (params.get('q') || '').trim();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatOptions, setChatOptions] = useState(() => loadTaskOptions());
  const chat = useStudioChat({ model: chatOptions.model, effort: chatOptions.effort });

  const changeChatOptions = (next) => {
    setChatOptions(next);
    saveTaskOptions(next);
  };

  useEffect(() => {
    if (!query) {
      setResults(null);
      return;
    }
    let live = true;
    setLoading(true);
    const run = async () => {
      const [tasks, projects, agents, automations, templates, artifacts, sites, files] = await Promise.all([
        base44.entities.StudioTask.filter(
          { $or: [{ title: like(query) }, { instruction: like(query) }] },
          { sort: '-created_date', limit: 12 }
        ),
        base44.entities.Project.filter({ name: like(query) }, { sort: '-updated_date', limit: 8 }),
        base44.entities.StudioAgent.filter({ name: like(query) }, { limit: 8 }),
        base44.entities.Automation.filter({ title: like(query) }, { limit: 8 }),
        base44.entities.Template.filter({ name: like(query) }, { limit: 8 }),
        base44.entities.StudioTask.filter(artifactMatch(query), { sort: '-created_date', limit: 12 }),
        base44.entities.StudioTask.filter(
          { 'deliverable.type': 'website', ...artifactMatch(query) },
          { sort: '-created_date', limit: 8 }
        ),
        base44.entities.StudioFile.filter({ name: like(query) }, { sort: '-created_date', limit: 8 }),
      ]);
      if (!live) return;
      const websiteIds = new Set(sites.items.map((task) => task.id));
      setResults({
        tasks: tasks.items,
        projects: projects.items,
        websites: sites.items,
        artifacts: artifacts.items.filter(
          (task) => !websiteIds.has(task.id) && task.deliverable?.type !== 'website'
        ),
        files: files.items,
        agents: agents.items,
        automations: automations.items,
        templates: templates.items,
      });
      setLoading(false);
    };
    run();
    return () => {
      live = false;
    };
  }, [query]);

  const total = useMemo(
    () => (results ? Object.values(results).reduce((sum, list) => sum + list.length, 0) : 0),
    [results]
  );

  const submit = (event) => {
    event.preventDefault();
    setParams(term.trim() ? { q: term.trim() } : {});
  };

  return (
    <div className="mx-auto w-full max-w-[900px] px-5 py-8 lg:px-10 lg:py-10">
      <h1 className="text-[15px] font-medium">Ask or search</h1>

      <div className="mt-3 flex h-[320px] flex-col rounded-xl border border-border bg-card p-3">
        <div className="mb-1.5 flex shrink-0 items-center gap-1.5">
          <Sparkles size={12} className="text-muted-foreground" />
          <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Ask the studio</p>
        </div>
        <AIChat
          chat={chat}
          options={chatOptions}
          onOptionsChange={changeChatOptions}
          placeholder={query ? `Ask about “${query}”` : 'Describe what you want built'}
          hint="The fastest way in: describe the build and it starts as a real task. Results for what already exists sit below."
        />
      </div>

      <form onSubmit={submit} className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <SearchIcon size={14} className="shrink-0 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          autoFocus
          placeholder="Search tasks, projects, websites, artifacts, files, agents"
          aria-label="Search everything"
          className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground"
        />
        <span className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
          ⌘K
        </span>
      </form>

      {loading && (
        <div className="mt-8 grid place-items-center py-10">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && !query && (
        <p className="mt-8 text-[12px] text-muted-foreground">
          Type a term and press enter. Results are grouped by workspace surface.
        </p>
      )}

      {!loading && query && total === 0 && (
        <p className="mt-8 text-[12px] text-muted-foreground">
          Nothing matched “{query}”. Try a shorter term.
        </p>
      )}

      {!loading && total > 0 && (
        <div className="mt-4 space-y-5">
          <ResultSection title="Tasks" count={results.tasks.length}>
            {results.tasks.map((task) => (
              <ResultRow key={task.id} to={`/task/${task.id}`} title={task.title || 'Untitled task'} meta={task.summary || task.instruction}>
                <StatusPill status={task.status} />
              </ResultRow>
            ))}
          </ResultSection>

          <ResultSection title="Projects" count={results.projects.length}>
            {results.projects.map((project) => (
              <ResultRow key={project.id} to={`/studio/${project.id}`} title={project.name} meta={project.client_name || project.description} />
            ))}
          </ResultSection>

          <ResultSection title="Websites" count={results.websites.length}>
            {results.websites.map((task) => (
              <ResultRow key={task.id} to={`/websites/${task.id}`} title={task.deliverable?.name} meta={task.deliverable?.detail || task.title} />
            ))}
          </ResultSection>

          <ResultSection title="Artifacts" count={results.artifacts.length}>
            {results.artifacts.map((task) => (
              <ResultRow key={task.id} to={`/task/${task.id}`} title={task.deliverable?.name} meta={task.deliverable?.detail || task.title}>
                <span className="shrink-0 rounded-full border border-border px-1.5 py-[1px] text-[10px] capitalize text-muted-foreground">
                  {task.deliverable?.type || 'file'}
                </span>
              </ResultRow>
            ))}
          </ResultSection>

          <ResultSection title="Files" count={results.files.length}>
            {results.files.map((file) => (
              <ResultRow
                key={file.id}
                to="/files"
                title={file.name}
                meta={[file.mime_type, file.size ? prettySize(file.size) : ''].filter(Boolean).join(' · ')}
              />
            ))}
          </ResultSection>

          <ResultSection title="Agents" count={results.agents.length}>
            {results.agents.map((agent) => (
              <ResultRow key={agent.id} to="/agents" title={agent.name} meta={agent.role || agent.instructions} />
            ))}
          </ResultSection>

          <ResultSection title="Scheduled" count={results.automations.length}>
            {results.automations.map((automation) => (
              <ResultRow key={automation.id} to="/automations" title={automation.title} meta={automation.instruction} />
            ))}
          </ResultSection>

          <ResultSection title="Templates" count={results.templates.length}>
            {results.templates.map((template) => (
              <ResultRow key={template.id} to="/templates" title={template.name} meta={template.tagline || template.description} />
            ))}
          </ResultSection>
        </div>
      )}
    </div>
  );
}