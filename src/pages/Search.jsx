import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatusPill from '@/components/manus/StatusPill';

const like = (value) => ({ $regex: value, $options: 'i' });

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') || '');
  const query = (params.get('q') || '').trim();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults(null);
      return;
    }
    let live = true;
    setLoading(true);
    const run = async () => {
      const [tasks, projects, agents, automations, templates] = await Promise.all([
        base44.entities.StudioTask.filter(
          { $or: [{ title: like(query) }, { instruction: like(query) }] },
          { sort: '-created_date', limit: 12 }
        ),
        base44.entities.Project.filter({ name: like(query) }, { sort: '-updated_date', limit: 8 }),
        base44.entities.StudioAgent.filter({ name: like(query) }, { limit: 8 }),
        base44.entities.Automation.filter({ title: like(query) }, { limit: 8 }),
        base44.entities.Template.filter({ name: like(query) }, { limit: 8 }),
      ]);
      if (!live) return;
      setResults({
        tasks: tasks.items,
        projects: projects.items,
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
      <h1 className="text-[15px] font-medium">Search</h1>

      <form onSubmit={submit} className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <SearchIcon size={14} className="shrink-0 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          autoFocus
          placeholder="Search tasks, projects, agents, automations, templates"
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
          <Section title="Tasks" count={results.tasks.length}>
            {results.tasks.map((task) => (
              <Row key={task.id} to={`/task/${task.id}`} title={task.title || 'Untitled task'} meta={task.summary || task.instruction}>
                <StatusPill status={task.status} />
              </Row>
            ))}
          </Section>

          <Section title="Projects" count={results.projects.length}>
            {results.projects.map((project) => (
              <Row key={project.id} to={`/studio/${project.id}`} title={project.name} meta={project.client_name || project.description} />
            ))}
          </Section>

          <Section title="Agents" count={results.agents.length}>
            {results.agents.map((agent) => (
              <Row key={agent.id} to="/agents" title={agent.name} meta={agent.role || agent.instructions} />
            ))}
          </Section>

          <Section title="Scheduled" count={results.automations.length}>
            {results.automations.map((automation) => (
              <Row key={automation.id} to="/automations" title={automation.title} meta={automation.instruction} />
            ))}
          </Section>

          <Section title="Templates" count={results.templates.length}>
            {results.templates.map((template) => (
              <Row key={template.id} to="/templates" title={template.name} meta={template.tagline || template.description} />
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, count, children }) {
  if (!count) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{title}</h2>
        <span className="text-[10.5px] text-muted-foreground">{count}</span>
      </div>
      <div className="mt-1.5 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">{children}</div>
    </section>
  );
}

function Row({ to, title, meta, children }) {
  return (
    <Link to={to} className="block px-3.5 py-2.5 transition-colors hover:bg-secondary/50">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-[12.5px] font-medium">{title}</p>
        {children}
      </div>
      {meta && <p className="mt-0.5 line-clamp-1 text-[10.5px] text-muted-foreground">{meta}</p>}
    </Link>
  );
}