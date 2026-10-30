import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUp, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModelPicker from '@/components/composer/ModelPicker';
import StatusPill from '@/components/manus/StatusPill';
import { createTask } from '@/lib/taskEngine';
import { loadTaskOptions, saveTaskOptions } from '@/lib/taskOptions';

const EXAMPLES = [
  'Draft a one-page offer for facility managers',
  'Build a landing page for a pressure-washing company',
  'Plan a 4-week content calendar for a dental clinic',
];

export default function NewTask() {
  const navigate = useNavigate();
  const areaRef = useRef(null);
  const [draft, setDraft] = useState('');
  const [options, setOptions] = useState(loadTaskOptions);
  const [recent, setRecent] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    areaRef.current?.focus();
    const load = async () => {
      const page = await base44.entities.StudioTask.filter({}, { sort: '-created_date', limit: 5 });
      setRecent(page.items);
    };
    load();
  }, []);

  const update = (next) => {
    setOptions(next);
    saveTaskOptions(next);
  };

  const submit = async () => {
    const instruction = draft.trim();
    if (!instruction || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await createTask({ instruction, model: options.model, effort: options.effort });
      navigate(`/task/${res.task_id}`);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[720px] px-5 pb-16 pt-10 sm:pt-16">
      <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">New task</p>
      <h1 className="mt-1.5 font-heading text-[26px] leading-tight tracking-[-0.02em] sm:text-[30px]">
        What should I work on?
      </h1>

      <div className="mt-5 rounded-[18px] border border-border bg-card px-3.5 pb-2.5 pt-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_14px_34px_-26px_rgba(0,0,0,0.35)]">
        <textarea
          ref={areaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={3}
          placeholder="Describe the outcome. I plan it, write it and hand back the finished deliverable."
          className="w-full resize-none bg-transparent px-1 py-1 text-[13.5px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />

        <div className="flex items-center justify-between gap-2 pt-2">
          <ModelPicker options={options} onChange={update} disabled={busy} />
          <button
            type="button"
            onClick={submit}
            disabled={busy || !draft.trim()}
            aria-label="Start task"
            className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${
              draft.trim() && !busy ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={15} strokeWidth={2.2} />}
          </button>
        </div>
      </div>

      {error && <p className="mt-2 text-[11.5px] text-destructive">{error}</p>}
      {busy && <p className="mt-2 text-[11.5px] text-muted-foreground">Starting the run. This page opens the session when it begins.</p>}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setDraft(example);
              areaRef.current?.focus();
            }}
            className="rounded-full border border-border px-2.5 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {example}
          </button>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="mt-9">
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