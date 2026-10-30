import React from 'react';

export function SettingsCard({ title, description, children, footer }) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-[12.5px] font-medium">{title}</h2>
        {description && <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      <div className="px-4 py-3">{children}</div>
      {footer && <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-4 py-2.5">{footer}</div>}
    </section>
  );
}

export function SettingsRow({ label, hint, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2.5 last:border-b-0 last:pb-0 first:pt-0">
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-border p-0.5">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
            value === key ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}