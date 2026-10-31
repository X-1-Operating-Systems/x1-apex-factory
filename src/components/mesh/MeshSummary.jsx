import React from 'react';

export default function MeshSummary({ ok, total, score, checkedAt }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-border pb-3">
      <p className="font-heading text-[26px] leading-none">
        {ok}
        <span className="text-muted-foreground">/{total}</span>
      </p>
      <p className="text-[12px] text-muted-foreground">systems answering</p>
      <p className="ml-auto text-[11px] text-muted-foreground">
        {score}% · {checkedAt ? new Date(checkedAt).toLocaleTimeString() : 'never'}
      </p>
    </div>
  );
}