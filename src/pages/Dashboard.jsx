import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Composer from '@/components/dashboard/Composer';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import NewProjectDialog from '@/components/NewProjectDialog';
import ModelPicker from '@/components/composer/ModelPicker';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import TemplateRow from '@/components/dashboard/TemplateRow';
import StatusPill from '@/components/manus/StatusPill';
import { createTask } from '@/lib/taskEngine';
import { loadTaskOptions, saveTaskOptions } from '@/lib/taskOptions';

export default function Dashboard() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [recent, setRecent] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [brief, setBrief] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [options, setOptions] = useState(() => loadTaskOptions());
  const [attachments, setAttachments] = useState([]);
  const [runCount, setRunCount] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [templatePage, taskPage] = await Promise.all([
        base44.entities.Template.filter({}, { sort: 'display_order', limit: 60 }),
        base44.entities.StudioTask.filter({}, { sort: '-created_date', limit: 5 }),
      ]);
      setTemplates(templatePage.items);
      setRecent(taskPage.items);
    };
    load();
    base44.entities.StudioTask.count().then(setRunCount).catch(() => setRunCount(0));
  }, []);

  const changeOptions = (next) => {
    setOptions(next);
    saveTaskOptions(next);
  };

  const open = (text, tplId) => {
    setBrief(text || '');
    setTemplateId(tplId || '');
    setDialogOpen(true);
  };

  const start = async (text) => {
    const instruction = String(text || '').trim();
    if (!instruction || starting) return;
    setStarting(true);
    setError('');
    try {
      const res = await createTask({
        instruction,
        model: options.model,
        effort: options.effort,
        attachments,
      });
      setAttachments([]);
      navigate(`/task/${res.task_id}`);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
      setStarting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col items-center px-5 pb-16 pt-12 sm:pt-20">
      <div className="w-full max-w-[680px]">
        <div className="mb-6 flex items-center justify-between">
          <ModelPicker options={options} onChange={changeOptions} disabled={starting} />
          <span
            title="Tasks run in this studio"
            aria-label="Tasks run in this studio"
            className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground"
          >
            <Sparkles size={11} /> {runCount === null ? '·' : runCount}
          </span>
        </div>

        <h1 className="mb-6 text-center font-heading text-[28px] font-normal tracking-[-0.02em] sm:text-[34px]">
          What can I do for you?
        </h1>

        <Composer
          onSubmit={start}
          onPickTemplate={() => open('')}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          busy={starting}
        />

        {starting && <p className="mt-2 text-[11.5px] text-muted-foreground">Starting the run…</p>}
        {error && <p className="mt-2 text-[11.5px] text-destructive">{error}</p>}

        <OnboardingChecklist />

        <ProjectGrid onNew={() => open('')} />

        {recent.length > 0 && (
          <div className="mt-10">
            <p className="mb-2 text-[12.5px] text-muted-foreground">Recent tasks</p>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {recent.map((task) => (
                <Link
                  key={task.id}
                  to={`/task/${task.id}`}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[12.5px] transition-colors hover:bg-secondary"
                >
                  <span className="truncate">{task.title || 'Untitled task'}</span>
                  <StatusPill status={task.status} />
                </Link>
              ))}
            </div>
          </div>
        )}

        <TemplateRow templates={templates} onOpen={(id) => open('', id)} />

        <p className="mt-10 text-center text-[10.5px] leading-relaxed text-muted-foreground">
          X1 is an AI agent and can make mistakes. Please double-check before use.
        </p>
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