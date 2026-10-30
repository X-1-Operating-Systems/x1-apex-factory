import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import TemplateCard from '@/components/TemplateCard';
import NewProjectDialog from '@/components/NewProjectDialog';

const CATEGORIES = [
  ['all', 'All'],
  ['saas', 'SaaS'],
  ['agency', 'Agency'],
  ['local_service', 'Local service'],
  ['restaurant', 'Restaurant'],
  ['portfolio', 'Portfolio'],
  ['commerce', 'Commerce'],
  ['real_estate', 'Real estate'],
  ['clinic', 'Clinic'],
  ['fitness', 'Fitness'],
  ['professional', 'Professional'],
  ['event', 'Event'],
  ['editorial', 'Editorial'],
];

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preset, setPreset] = useState('');

  useEffect(() => {
    const load = async () => {
      const page = await base44.entities.Template.filter({}, { sort: 'display_order', limit: 200 });
      setTemplates(page.items);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(
    () => (category === 'all' ? templates : templates.filter((t) => t.category === category)),
    [templates, category]
  );

  const use = (template) => {
    setPreset(template.id);
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-8 lg:px-10 lg:py-12">
      <p className="text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">Library</p>
      <h1 className="display-title mt-2 text-[38px] leading-[1.02] lg:text-[48px]">Templates</h1>
      <p className="mt-2 max-w-[58ch] text-[13.5px] leading-relaxed text-muted-foreground">
        Industry structures with real, editable sections and design tokens. Pick one, then direct the agent to make it
        this client's own.
      </p>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {CATEGORIES.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={`rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
              category === key
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-panel h-[248px] animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} onUse={use} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="mt-10 text-center text-[12.5px] text-muted-foreground">No templates in this category yet.</p>
      )}

      <NewProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        templates={templates}
        initialTemplateId={preset}
      />
    </div>
  );
}