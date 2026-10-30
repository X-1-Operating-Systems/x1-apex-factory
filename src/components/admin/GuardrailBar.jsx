import React from 'react';

export default function GuardrailBar({ minutes, guardrail }) {
  const maxSession = Math.round((guardrail?.max_session_seconds ?? 600) / 60);
  const cap = Math.round((guardrail?.hard_cap_seconds ?? 1800) / 60);
  const concurrent = guardrail?.max_concurrent ?? 5;

  const chips = [
    `session ${maxSession}m default`,
    `${cap}m cap`,
    `${concurrent} concurrent`,
    minutes === null ? 'usage loading' : `${minutes} browser min used`,
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}