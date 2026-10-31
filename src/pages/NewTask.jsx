import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import useStudioChat from '@/hooks/useStudioChat';
import ChatThread from '@/components/chat/ChatThread';
import ChatComposer from '@/components/chat/ChatComposer';
import StatusPill from '@/components/manus/StatusPill';
import { loadTaskOptions, saveTaskOptions } from '@/lib/taskOptions';

const EXAMPLES = [
  'Build a landing page for a pressure-washing company',
  'Plan a 4-week content calendar for a dental clinic',
  'Draft a one-page offer for facility managers',
];

export default function NewTask() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const projectId = params.get('project') || '';
  const taskParam = params.get('task') || '';
  const [project, setProject] = useState(null);
  const [options, setOptions] = useState(loadTaskOptions);
  const [recent, setRecent] = useState([]);

  const chat = useStudioChat({
    projectId,
    model: options.model,
    effort: options.effort,
    taskId: taskParam,
  });

  useEffect(() => {
    base44.entities.StudioTask.filter({}, { sort: '-created_date', limit: 5 })
      .then((page) => setRecent(page.items || []))
      .catch(() => setRecent([]));
    if (projectId) {
      base44.entities.Project.get(projectId).then(setProject).catch(() => setProject(null));
    }
  }, [projectId]);

  // The conversation keeps its own address, so a reload lands back in the same run.
  useEffect(() => {
    if (!chat.taskId || chat.taskId === taskParam) return;
    const next = new URLSearchParams(params);
    next.set('task', chat.taskId);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.taskId]);

  // "New task" in the sidebar clears the address, so it also starts a clean conversation.
  useEffect(() => {
    if (!taskParam) chat.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskParam]);

  const updateOptions = (next) => {
    setOptions(next);
    saveTaskOptions(next);
  };

  const startOver = () => {
    const next = new URLSearchParams(params);
    next.delete('task');
    setParams(next, { replace: true });
    chat.reset();
  };

  const firstName = (user?.full_name || '').trim().split(' ')[0];
  const inThread = Boolean(chat.taskId || chat.events.length);

  if (!inThread) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col px-4 pb-10 pt-12 sm:pt-20">
        <div className="flex flex-1 flex-col items-center">
          <h1 className="text-center font-heading text-[27px] leading-tight tracking-[-0.02em] sm:text-[32px]">
            Hello{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="mt-1.5 text-center text-[13px] text-muted-foreground">What can I do for you?</p>

          {project && (
            <p className="mt-3 max-w-[520px] rounded-lg bg-secondary px-3 py-1.5 text-center text-[11px] leading-relaxed text-muted-foreground">
              In {project.name}
              {project.master_instruction ? ` · ${project.master_instruction.slice(0, 120)}` : ''}
            </p>
          )}

          <div className="mt-6 w-full max-w-[660px]">
            <ChatComposer
              rows={3}
              onSubmit={chat.send}
              options={options}
              onOptionsChange={updateOptions}
              busy={chat.busy}
            />
            {chat.error && <p className="mt-1.5 text-[11.5px] text-destructive">{chat.error}</p>}
          </div>

          <div className="mt-3 flex w-full max-w-[660px] flex-wrap justify-center gap-1.5">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => chat.send(example)}
                disabled={chat.busy}
                className="max-w-full truncate rounded-full border border-border bg-card px-3 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-60"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {recent.length > 0 && (
          <div className="mt-10">
            <p className="mb-2 text-[11.5px] text-muted-foreground">Pick up where you left off</p>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {recent.map((task) => (
                <Link
                  key={task.id}
                  to={`/task/${task.id}`}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 transition-colors hover:bg-secondary"
                >
                  <span className="min-w-0 flex-1 truncate text-[12.5px]">{task.title || 'Untitled task'}</span>
                  <StatusPill status={task.status} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col px-4 pb-1">
      <header className="sticky top-0 z-10 -mx-4 flex items-center gap-2 border-b border-border bg-background/90 px-4 py-2 backdrop-blur">
        <p className="min-w-0 flex-1 truncate text-[12.5px] font-medium">
          {chat.task?.title || 'Working…'}
        </p>
        <StatusPill status={chat.task?.status} />
        <Link
          to={`/task/${chat.taskId}`}
          className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Full task <ArrowUpRight size={10} />
        </Link>
      </header>

      <div className="flex-1 py-4">
        <ChatThread events={chat.events} busy={chat.busy} />
      </div>

      <div className="sticky bottom-0 -mx-4 bg-background/95 px-4 pb-3 pt-2 backdrop-blur">
        <ChatComposer
          rows={2}
          placeholder="Reply, or send another instruction"
          onSubmit={chat.send}
          options={options}
          onOptionsChange={updateOptions}
          busy={chat.busy}
        />
        <div className="mt-1.5 flex items-center justify-between">
          <button
            type="button"
            onClick={startOver}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus size={10} /> New conversation
          </button>
          {chat.error && <p className="text-[11px] text-destructive">{chat.error}</p>}
        </div>
      </div>
    </div>
  );
}