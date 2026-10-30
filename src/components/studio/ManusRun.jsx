import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowUp, CheckCircle2, ExternalLink, Loader2, Sparkles, AlertCircle, Square } from 'lucide-react';

function buildBrief(project, page, instruction) {
  const sections = (page?.blocks || [])
    .slice(0, 12)
    .map((b) => `- ${b.type}: ${String(b.props?.title || b.props?.eyebrow || '').slice(0, 80)}`)
    .join('\n');

  return `${instruction}

PROJECT
Name: ${project?.name || 'Untitled'}
Client: ${project?.client_name || 'unspecified'}
Template: ${project?.template_name || 'custom'}

PAGE
${page?.name || 'Home'} (${page?.path || '/'})
Sections:
${sections || '- none yet'}

Work in the Manus workspace: research what is needed, build the real deliverable, and return files plus a short summary of what you changed.`.slice(0, 5900);
}

export default function ManusRun({ project, page }) {
  const [instruction, setInstruction] = useState('');
  const [run, setRun] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    if (!run?.task_id || status?.finished) return undefined;
    const poll = async () => {
      try {
        const res = await base44.functions.invoke('manusAgent', { action: 'status', task_id: run.task_id });
        setStatus(res.data);
      } catch (err) {
        setError(err?.response?.data?.error || err.message);
      }
    };
    poll();
    timer.current = setInterval(poll, 5000);
    return () => clearInterval(timer.current);
  }, [run?.task_id, status?.finished]);

  const start = async () => {
    const text = instruction.trim();
    if (!text || busy) return;
    setBusy(true);
    setError('');
    setStatus(null);
    try {
      const res = await base44.functions.invoke('manusAgent', {
        action: 'create',
        instruction: buildBrief(project, page, text),
        title: `${project?.name || 'Build'} — ${text.slice(0, 60)}`,
      });
      setRun(res.data);
      setInstruction('');
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  const answer = async () => {
    const text = reply.trim();
    if (!text || !run?.task_id) return;
    setReply('');
    await base44.functions.invoke('manusAgent', { action: 'send', task_id: run.task_id, message: text });
  };

  if (!run) {
    return (
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          <Sparkles size={11} /> Run this on Manus
        </div>
        <div className="mt-2 flex items-end gap-2">
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                start();
              }
            }}
            rows={1}
            placeholder="Research the market and build the launch page"
            className="max-h-24 w-full resize-none bg-transparent py-1 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={start}
            disabled={busy || !instruction.trim()}
            aria-label="Start Manus task"
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors ${
              instruction.trim() && !busy ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <ArrowUp size={13} strokeWidth={2.2} />}
          </button>
        </div>
        {error && <p className="mt-1.5 text-[11.5px] text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 text-[11.5px]">
          {status?.finished ? (
            <CheckCircle2 size={12} className="shrink-0 text-emerald-600" />
          ) : (
            <Loader2 size={12} className="shrink-0 animate-spin text-info" />
          )}
          <span className="truncate">{run.task_title || 'Manus task'}</span>
        </div>
        {run.task_url && (
          <a
            href={run.task_url}
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-1 text-[11.5px] text-muted-foreground hover:text-foreground"
          >
            Open in Manus <ExternalLink size={10} />
          </a>
        )}
      </div>

      {!status && <p className="mt-1.5 text-[11.5px] text-muted-foreground">Starting the agent…</p>}

      {status?.steps?.length > 0 && !status?.finished && (
        <div className="mt-2 space-y-1">
          {status.steps.slice(-3).map((step, i) => (
            <p key={i} className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground" /> {step}
            </p>
          ))}
        </div>
      )}

      {status?.waiting && (
        <div className="mt-2 rounded-lg bg-secondary p-2">
          <p className="text-[12px] leading-relaxed">{status.waiting.description}</p>
          {status.waiting.options?.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {status.waiting.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => base44.functions.invoke('manusAgent', { action: 'send', task_id: run.task_id, message: option })}
                  className="rounded-full border border-border bg-card px-2 py-1 text-[11px] transition-colors hover:bg-accent"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') answer();
              }}
              placeholder="Answer the agent"
              className="w-full bg-transparent text-[12px] outline-none placeholder:text-muted-foreground"
            />
            <button type="button" onClick={answer} aria-label="Send answer" className="shrink-0 text-muted-foreground hover:text-foreground">
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      )}

      {status?.error && (
        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-destructive">
          <AlertCircle size={11} /> {status.error}
        </p>
      )}

      {status?.answer && (
        <p className="mt-2 max-h-32 overflow-hidden whitespace-pre-line text-[12.5px] leading-relaxed text-foreground/85">{status.answer}</p>
      )}

      {status?.artifacts?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {status.artifacts.map((artifact, i) => (
            <a
              key={i}
              href={artifact.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-secondary"
            >
              {artifact.name.slice(0, 28)} <ExternalLink size={10} />
            </a>
          ))}
        </div>
      )}

      {status?.finished && (
        <button
          type="button"
          onClick={() => {
            setRun(null);
            setStatus(null);
          }}
          className="mt-2 flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-foreground"
        >
          <Square size={10} /> New Manus run
        </button>
      )}
    </div>
  );
}