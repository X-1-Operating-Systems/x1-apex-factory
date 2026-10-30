import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProjectCard from '@/components/ProjectCard';

export default function ProjectGrid({ onNew }) {
  const [projects, setProjects] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const page = await base44.entities.Project.filter({}, { sort: '-updated_date', limit: 24 });
      setProjects(page.items);
      const agg = await base44.entities.StudioPage.aggregate({ groupBy: 'project_id' });
      const map = {};
      (agg.rows || []).forEach((row) => {
        map[row.project_id] = row.count;
      });
      setCounts(map);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <section className="mt-12">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12.5px] text-muted-foreground">Projects</p>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus size={12} /> New project
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-[124px] animate-pulse rounded-2xl border border-border bg-secondary/60" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center">
          <p className="text-[12.5px] text-muted-foreground">
            No projects yet. Start one and the studio opens with a composed page.
          </p>
          <button
            type="button"
            onClick={onNew}
            className="mt-3 inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11.5px] transition-colors hover:bg-secondary"
          >
            <Plus size={12} /> New project
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} pageCount={counts[project.id] || 0} />
          ))}
        </div>
      )}
    </section>
  );
}