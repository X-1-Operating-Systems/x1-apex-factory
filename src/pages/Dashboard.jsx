import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Composer from '@/components/dashboard/Composer';
import NewProjectDialog from '@/components/NewProjectDialog';
import HomeTopBar from '@/components/home/HomeTopBar';
import HeroMark from '@/components/home/HeroMark';
import ActionCards from '@/components/home/ActionCards';
import MediaGallery from '@/components/home/MediaGallery';
import { createTask } from '@/lib/taskEngine';
import { loadTaskOptions, saveTaskOptions } from '@/lib/taskOptions';

export default function Dashboard() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [brief, setBrief] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [options, setOptions] = useState(() => loadTaskOptions());
  const [attachments, setAttachments] = useState([]);
  const [runCount, setRunCount] = useState(null);
  const [seed, setSeed] = useState({ text: '', n: 0 });

  useEffect(() => {
    base44.entities.Template.filter({}, { sort: 'display_order', limit: 60 }).then((page) => setTemplates(page.items));
    base44.entities.StudioTask.count().then(setRunCount).catch(() => setRunCount(0));
  }, []);

  const changeOptions = (next) => {
    setOptions(next);
    saveTaskOptions(next);
  };

  const pick = (text) => setSeed((prev) => ({ text, n: prev.n + 1 }));

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
    <div className="flex min-h-full flex-col px-4 pb-10 pt-4 sm:px-8">
      <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col">
        <HomeTopBar options={options} onChange={changeOptions} disabled={starting} runCount={runCount} />

        <div className="flex flex-1 flex-col justify-center py-8">
          <HeroMark />
          <ActionCards onPick={pick} />
          <MediaGallery />
        </div>

        <div className="mt-4">
          <Composer
            onSubmit={start}
            onPickTemplate={() => open('')}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            busy={starting}
            seed={seed}
          />

          {starting && <p className="mt-2 text-[11.5px] text-muted-foreground">Starting the run…</p>}
          {error && <p className="mt-2 text-[11.5px] text-destructive">{error}</p>}

          <p className="mt-6 text-center text-[10.5px] leading-relaxed text-muted-foreground">
            X1 is an AI agent and can make mistakes. Please double-check before use.
          </p>
        </div>
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