import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, ArrowUpRight } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import NewProjectDialog from '@/components/NewProjectDialog';
import { Button } from '@/components/ui/button';

function Stat({ label, value }) {
  return (
    <div className="px-1">
      <p className="display-title text-3xl leading-none">{value}</p>
      <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState({ templates: 0, passed: 0, releases: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [projectPage, templatePage, passed, releases] = await Promise.all([
        base44.entities.Project.filter({}, { sort: '-updated_date', limit: 60 }),
        base44.entities.Template.filter({}, { sort: 'display_order', limit: 200 }),
        base44.entities.QaRun.count({ verdict: 'pass' }),
        base44.entities.Deployment.count({}),
      ]);
      setProjects(projectPage.items);
      setTemplates(templatePage.items);
      setStats({ templates: templatePage.items.length, passed, releases });
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-8 lg:px-10 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">Client systems</p>
          <h1 className="display-title mt-2 text-[38px] leading-[1.02] lg:text-[52px]">Projects</h1>
          <p className="mt-2 max-w-[52ch] text-[13.5px] leading-relaxed text-muted-foreground">
            Every build runs the same path: a template sets the structure, the studio agent edits the canvas, and the
            review gates decide what is allowed to ship.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 rounded-full px-5" size="lg">
          <Plus size={15} /> New client build
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-border bg-card px-5 py-4 sm:grid-cols-4">
        <Stat label="Projects" value={projects.length} />
        <Stat label="Templates" value={stats.templates} />
        <Stat label="Reviews passed" value={stats.passed} />
        <Stat label="Release records" value={stats.releases} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ['01', 'Choose a template', 'Structure, tokens and copy arrive composed.'],
          ['02', 'Direct the agent', 'Chat edits the live canvas — copy, layout, sections.'],
          ['03', 'Review, then release', 'Validator, QA and Guardian gate every version.'],
        ].map(([n, title, body]) => (
          <div key={n} className="rounded-xl border border-border bg-card/60 px-4 py-3.5">
            <p className="text-[10px] tracking-[0.2em] text-primary">{n}</p>
            <p className="mt-1.5 text-[12.5px] font-medium">{title}</p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Your builds</h2>
        <Link to="/templates" className="flex items-center gap-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground">
          Browse templates <ArrowUpRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[148px] animate-pulse rounded-xl border border-border bg-card/60" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <p className="display-title text-2xl">No projects yet</p>
          <p className="mx-auto mt-2 max-w-[42ch] text-[12.5px] leading-relaxed text-muted-foreground">
            Start from one of {stats.templates} templates and open the studio. The canvas, agent and review gates are
            ready.
          </p>
          <Button onClick={() => setDialogOpen(true)} className="mt-5 rounded-full" size="sm">
            Start the first build
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} templates={templates} />
    </div>
  );
}