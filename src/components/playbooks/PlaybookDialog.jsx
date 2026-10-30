import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Loader2, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createTask } from '@/lib/taskEngine';
import { playbookInstruction } from '@/lib/playbooks';

export default function PlaybookDialog({ playbook, open, onOpenChange }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState(null);

  // A playbook becomes one agent: reopening it finds the agent it already made.
  useEffect(() => {
    if (!open || !playbook) return;
    setError('');
    setSaved(false);
    setExisting(null);
    base44.entities.StudioAgent.filter(
      { $or: [{ installed_from: playbook.key }, { name: playbook.name }] },
      { limit: 1 }
    )
      .then((page) => {
        const hit = page.items?.[0] || null;
        setExisting(hit);
        setSaved(Boolean(hit));
      })
      .catch(() => {});
  }, [open, playbook]);

  if (!playbook) return null;

  const run = async () => {
    setBusy('run');
    setError('');
    try {
      const res = await createTask({
        title: playbook.name,
        instruction: playbookInstruction(playbook),
        effort: playbook.effort,
      });
      navigate(`/task/${res.task_id}`);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
      setBusy('');
    }
  };

  const saveAgent = async () => {
    setBusy('agent');
    setError('');
    try {
      const agent = await base44.entities.StudioAgent.create({
        name: playbook.name,
        role: playbook.summary,
        category: playbook.agentCategory,
        tone: 'Direct',
        instructions: playbookInstruction(playbook),
        task_title: playbook.name,
        installed_from: playbook.key,
      });
      setExisting(agent);
      setSaved(true);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-medium">{playbook.name}</DialogTitle>
        </DialogHeader>

        <p className="text-[11.5px] leading-relaxed text-muted-foreground">{playbook.summary}</p>

        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {playbook.steps.length} steps · {playbook.effort} effort
          </p>
          <ol className="mt-2 space-y-1.5">
            {playbook.steps.map((step, index) => (
              <li key={step} className="flex gap-2 text-[11.5px] leading-relaxed">
                <span className="mt-[1px] grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border text-[9.5px] text-muted-foreground">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {error && <p className="text-[11.5px] text-destructive">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {saved ? (
            <Link
              to="/agents"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11.5px] transition-colors hover:bg-secondary"
            >
              <Bot size={11} /> Saved to Agents
            </Link>
          ) : (
            <button
              type="button"
              onClick={saveAgent}
              disabled={Boolean(busy)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11.5px] transition-colors hover:bg-secondary disabled:opacity-50"
            >
              {busy === 'agent' ? <Loader2 size={11} className="animate-spin" /> : <Bot size={11} />}
              Save as agent
            </button>
          )}
          <button
            type="button"
            onClick={run}
            disabled={Boolean(busy)}
            className="glass-blue inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] font-medium disabled:opacity-50"
          >
            {busy === 'run' ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
            {busy === 'run' ? 'Starting' : 'Run playbook'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}