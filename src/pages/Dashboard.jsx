import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Composer from '@/components/dashboard/Composer';
import ProjectRow from '@/components/ProjectRow';
import NewProjectDialog from '@/components/NewProjectDialog';

function Metric({ label, value }) {
  return (
    <div className="flex items-baseline gap-2">
      <p className="text-[15px] font-medium tracking-tight">{value}</p>
      <p className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState({ templates: 0, passed: 0, releases: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [brief, setBrief] = useState('');

  useEffect(() => {
    const load = async () => {
      const [projectPage, templatePage, templateCount, passed, releases] = await Promise.all([
        base44.entities.Project.filter({}, { sort: '-updated_date', limit: 60 }),
        base44.entities.Template.filter({}, { sort: 'display_order', limit: 60 }),
        base44.entities.Template.count({}),
        base44.entities.QaRun.count({ verdict: 'pass' }),
        base44.entities.Deployment.count({}),
      ]);
      setProjects(projectPage.items);
      setTemplates(templatePage.items);
      setStats({ templates: templateCount, passed, releases });
      setLoading(false);
    };
    load();
  }, []);

  const open = (text) => {
    setBrief(text || '');
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-[880px] px-5 py-10 lg:py-16">
      <p className="text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">X1 Apex Factory</p>
      <h1 className="mt-3 text-[30px] font-normal leading-[1.15] tracking-[-0.02em] lg:text-[38px]">
        What are we building today?
      </h1>

      <div className="mt-6">
        <Composer onSubmit={open} onBlank={() => open('')} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Metric label="projects" value={projects.length} />
        <Metric label="templates" value={stats.templates} />
        <Metric label="reviews passed" value={stats.passed} />
        <Metric label="releases" value={stats.releases} />
        <Link to="/templates" className="ml-auto flex items-center gap-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground">
          Browse the library <ArrowUpRight size={12} />
        </Link>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Recent work</h2>
        <Link to="/releases" className="text-[11.5px] text-muted-foreground transition-colors hover:text-foreground">
          Release ledger
        </Link>
      </div>

      {loading ? (
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass-panel h-14 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel mt-3 rounded-2xl px-6 py-12 text-center">
          <p className="text-[17px] tracking-tight">Nothing in the factory yet</p>
          <p className="mx-auto mt-2 max-w-[46ch] text-[12.5px] leading-relaxed text-muted-foreground">
            {stats.templates} industry templates are ready. Describe the build above, or start from the library.
          </p>
          <button
            type="button"
            onClick={() => open('')}
            className="glass-blue mt-5 rounded-full px-4 py-2 text-[12px] font-semibold"
          >
            Start the first build
          </button>
        </div>
      ) : (
        <div className="glass-panel mt-3 overflow-hidden rounded-2xl">
          {projects.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </div>
      )}

      <NewProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        templates={templates}
        initialName={brief}
      />
    </div>
  );
}