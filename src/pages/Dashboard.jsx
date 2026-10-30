import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Composer from '@/components/dashboard/Composer';
import NewProjectDialog from '@/components/NewProjectDialog';

export default function Dashboard() {
  const [templates, setTemplates] = useState([]);
  const [recent, setRecent] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [brief, setBrief] = useState('');

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

  const open = (text) => {
    setBrief(text || '');
    setDialogOpen(true);
  };

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-14">
      <div className="w-full max-w-[720px]">
        <h1 className="display-title mb-7 text-center text-[30px] leading-tight tracking-[-0.02em] sm:text-[38px]">
          What can I do for you?
        </h1>

        <Composer onSubmit={open} onBlank={() => open('')} />

        {recent.length > 0 && (
          <div className="mt-10 lg:hidden">
            <p className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Recent</p>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {recent.map((p) => (
                <Link
                  key={p.id}
                  to={`/studio/${p.id}`}
                  className="block truncate px-3 py-2.5 text-[12.5px] hover:bg-secondary"
                >
                  {p.name}
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
        initialName={brief}
      />
    </div>
  );
}