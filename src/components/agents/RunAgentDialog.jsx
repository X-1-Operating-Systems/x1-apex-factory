import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { createTask } from '@/lib/taskEngine';
import { Loader2 } from 'lucide-react';

export default function RunAgentDialog({ open, onOpenChange, agent, onRan }) {
  const [brief, setBrief] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [task, setTask] = useState(null);

  useEffect(() => {
    if (open) {
      setBrief('');
      setError('');
      setTask(null);
    }
  }, [open]);

  const run = async () => {
    const assignment = brief.trim();
    if (!assignment || busy) return;
    setBusy(true);
    setError('');
    try {
      const instruction = [
        `You are ${agent.name}${agent.role ? `, ${agent.role}` : ''}.`,
        agent.tone ? `Tone: ${agent.tone}.` : '',
        '',
        'Standing instructions:',
        agent.instructions,
        '',
        'Assignment:',
        assignment,
      ].join('\n');

      const res = await createTask({
        instruction,
        title: agent.task_title || `${agent.name} · ${assignment.slice(0, 70)}`,
        agent_id: agent.id,
      });

      await base44.entities.StudioAgent.update(agent.id, {
        run_count: (agent.run_count || 0) + 1,
        last_task_id: res.task_id,
        last_task_url: res.task_url || '',
      });

      setTask(res);
      onRan?.();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-medium">Run {agent?.name}</DialogTitle>
          <DialogDescription>
            Describe the assignment. Your standing instructions travel with it into a new live task.
          </DialogDescription>
        </DialogHeader>

        {task ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-accent px-3 py-2.5">
              <p className="text-[12px] font-medium">Task started</p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{task.task_title || task.task_id}</p>
            </div>
            <Link to={`/task/${task.task_id}`} onClick={() => onOpenChange(false)}>
              <Button className="w-full">Open live task</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <Textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={4}
              placeholder="A landing page for a Boston dental practice, emphasizing same-day emergency visits."
              className="text-[12.5px]"
            />
            {error && <p className="text-[11.5px] text-destructive">{error}</p>}
            <Button className="w-full gap-1.5" onClick={run} disabled={!brief.trim() || busy}>
              {busy && <Loader2 size={13} className="animate-spin" />}
              {busy ? 'Starting…' : 'Start task'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}