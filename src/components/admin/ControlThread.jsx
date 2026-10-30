import React from 'react';
import ResultCard from './ResultCard';
import ConfirmChip from './ConfirmChip';

export default function ControlThread({ messages, busy, onConfirm, onCancel, onAction }) {
  if (!messages.length) {
    return (
      <div className="mx-auto flex max-w-[620px] flex-col gap-3 px-1 py-12 text-center">
        <h2 className="display-title text-[27px]">Control plane</h2>
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          Every browser capability runs from this thread. Your message resolves to one named action with
          typed parameters before anything executes, and destructive actions ask first.
        </p>
        <div className="mt-2 space-y-1.5 text-left text-[11.5px] leading-relaxed text-muted-foreground">
          <p>· Open a recorded session in us-west-2 and show me the live view</p>
          <p>· How many browser minutes has this project used</p>
          <p>· Start a run that fills the demo order form and returns the values</p>
          <p>· Show the transcript of the last run, then release its session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-3">
      {messages.map((message) => {
        if (message.role === 'user') {
          return (
            <div key={message.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl bg-secondary px-3 py-2 text-[12.5px] leading-relaxed">
                {message.text}
              </p>
            </div>
          );
        }

        if (message.role === 'assistant') {
          return (
            <p key={message.id} className="max-w-[92%] text-[12.5px] leading-relaxed text-foreground/90">
              {message.text}
            </p>
          );
        }

        if (message.role === 'confirm') {
          return (
            <ConfirmChip
              key={message.id}
              action={message.action}
              summary={message.summary}
              resolved={Boolean(message.resolved)}
              onConfirm={() => onConfirm(message.id, message.action, message.params)}
              onCancel={() => onCancel(message.id, message.action, message.params)}
            />
          );
        }

        return (
          <div key={message.id} className="space-y-1.5">
            <p className="font-mono text-[10px] text-muted-foreground">
              {message.label || message.action}
            </p>
            {message.state === 'running' && !message.result ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-border border-t-foreground" />
                <span className="text-[11px] text-muted-foreground">Running {message.action}</span>
              </div>
            ) : (
              <ResultCard action={message.action} result={message.result} onAction={onAction} />
            )}
          </div>
        );
      })}
      {busy && <p className="text-[10.5px] text-muted-foreground">Working…</p>}
    </div>
  );
}