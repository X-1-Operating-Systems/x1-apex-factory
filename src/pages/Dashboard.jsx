import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Composer from '@/components/dashboard/Composer';
import NewProjectDialog from '@/components/NewProjectDialog';
import PageCanvas from '@/components/studio/PageCanvas';

export default function Dashboard() {
  const [templates, setTemplates] = useState([]);
  const [recent, setRecent] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [brief, setBrief] = useState('');
  const [templateId, setTemplateId] = useState('');

  useEffect(() => {
    const load = async () => {
      const [templatePage, projectPage] = await Promise.all([
        base44.entities.Template.filter({}, { sort: 'display_order', limit: 60 }),
        base44.entities.Project.filter({}, { sort: '-updated_date', limit: 5 }),
      ]);
      setTemplates(templatePage.items);
      setRecent(projectPage.items);
    };
    load();
  }, []);

  const open = (text, tplId) => {
    setBrief(text || '');
    setTemplateId(tplId || '');
    setDialogOpen(true);
  };

  return (
    <div className="flex min-h-full flex-col items-center px-5 pb-16 pt-12 sm:pt-20">
      <div className="w-full max-w-[680px]">
        <h1 className="mb-6 text-center font-heading text-[28px] font-normal tracking-[-0.02em] sm:text-[34px]">
          What can I do for you?
        </h1>

        <Composer onSubmit={(text) => open(text)} onPickTemplate={() => open('')} />

        {templates.length > 0 && (
          <div className="mt-12">
            <p className="mb-3 text-[12.5px] text-muted-foreground">Start from a template</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {templates.slice(0, 4).map((t) => (
                <button key={t.id} type="button" onClick={() => open('', t.id)} className="group text-left">
                  <div className="overflow-hidden rounded-lg border border-border bg-card transition-colors group-hover:border-foreground/25">
                    <div className="pointer-events-none h-[104px] overflow-hidden">
                      <PageCanvas
                        blocks={t.blocks || []}
                        tokens={{
                          accent: t.accent || '#b4532a',
                          surface: t.surface || 'light',
                          headlineFont: t.headline_font || 'serif',
                        }}
                        showSelection={false}
                      />
                    </div>
                  </div>
                  <p className="mt-1.5 truncate text-[11.5px] font-medium">{t.name}</p>
                  <p className="truncate text-[10.5px] text-muted-foreground">{t.category.replace('_', ' ')}</p>
                </button>
              ))}
            </div>
            <Link to="/templates" className="mt-3 inline-block text-[11.5px] text-muted-foreground hover:text-foreground">
              View all templates
            </Link>
          </div>
        )}

        {recent.length > 0 && (
          <div className="mt-10">
            <p className="mb-2 text-[12.5px] text-muted-foreground">Recent tasks</p>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {recent.map((p) => (
                <Link
                  key={p.id}
                  to={`/studio/${p.id}`}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[12.5px] transition-colors hover:bg-secondary"
                >
                  <span className="truncate">{p.name}</span>
                  <span className="shrink-0 text-[10.5px] capitalize text-muted-foreground">{p.status}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <NewProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        templates={templates}
        initialTemplateId={templateId}
        initialName={brief}
      />
    </div>
  );
}