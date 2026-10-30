import React from 'react';
import { Link } from 'react-router-dom';

export function ResultSection({ title, count, children }) {
  if (!count) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{title}</h2>
        <span className="text-[10.5px] text-muted-foreground">{count}</span>
      </div>
      <div className="mt-1.5 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">{children}</div>
    </section>
  );
}

export function ResultRow({ to, title, meta, children }) {
  return (
    <Link to={to} className="block px-3.5 py-2.5 transition-colors hover:bg-secondary/50">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-[12.5px] font-medium">{title}</p>
        {children}
      </div>
      {meta && <p className="mt-0.5 line-clamp-1 text-[10.5px] text-muted-foreground">{meta}</p>}
    </Link>
  );
}