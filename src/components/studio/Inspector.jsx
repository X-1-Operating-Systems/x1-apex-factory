import React from 'react';
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from 'lucide-react';
import { BLOCK_LIBRARY, uid } from '@/components/studio/blockTheme';

const TEXT_KEYS = [
  ['eyebrow', 'Eyebrow'],
  ['title', 'Headline'],
  ['subtitle', 'Supporting line'],
  ['body', 'Body copy'],
  ['primaryCta', 'Primary action'],
  ['secondaryCta', 'Secondary action'],
  ['cta', 'Button label'],
  ['brand', 'Footer brand'],
  ['note', 'Fine print'],
  ['phone', 'Phone'],
  ['email', 'Email'],
];

const DEFAULTS = {
  hero: { eyebrow: 'New section', title: 'Write the promise', subtitle: 'One sentence that earns the next click.', primaryCta: 'Start' },
  stats: { items: [{ value: '01', label: 'Add a verified proof point' }] },
  features: { eyebrow: 'Capabilities', title: 'What we actually do', items: [{ title: 'First capability', body: 'Describe real delivery.' }] },
  showcase: { title: 'A closer look', body: 'Explain the work.', bullets: [], image: '' },
  gallery: { title: 'Selected work', images: [] },
  pricing: { title: 'Packages', plans: [{ name: 'Tier one', price: '—', features: ['Scope item'], cta: 'Enquire' }] },
  faq: { title: 'Questions', items: [{ q: 'A real question?', a: 'A direct answer.' }] },
  cta: { title: 'Ready to begin?', body: '', cta: 'Get in touch' },
  contact: { title: 'Talk to us', body: '', cta: 'Send enquiry' },
  text: { title: 'Editorial block', body: 'Write the long-form copy here.' },
  footer: { brand: 'Brand', links: [], note: '© 2026 · All rights reserved.' },
};

export default function Inspector({
  blocks,
  selectedId,
  onSelect,
  onMove,
  onDelete,
  onDuplicate,
  onAdd,
  onUpdateProps,
  tokens,
  onTokenChange,
  seo,
  onSeoChange,
}) {
  const selected = blocks.find((b) => b.id === selectedId);
  const index = blocks.findIndex((b) => b.id === selectedId);

  return (
    <div className="flex h-full flex-col overflow-y-auto scroll-thin">
      <div className="border-b border-border px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Design tokens</p>
        <div className="mt-3 flex items-center gap-2">
          {['#b4532a', '#1f4d3f', '#1d3a5f', '#6b2f4a', '#2f2a28', '#8a5a1f'].map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Accent ${c}`}
              onClick={() => onTokenChange({ accent: c })}
              className="h-6 w-6 rounded-full transition-transform hover:scale-110"
              style={{ background: c, outline: tokens.accent === c ? '2px solid hsl(var(--foreground))' : 'none', outlineOffset: 2 }}
            />
          ))}
        </div>
        <div className="mt-3 flex gap-1.5">
          {['light', 'dark'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onTokenChange({ surface: s })}
              className={`flex-1 rounded-md border px-2 py-1.5 text-[11px] font-medium capitalize transition-colors ${
                tokens.surface === s ? 'border-foreground bg-accent' : 'border-border text-muted-foreground'
              }`}
            >
              {s} site
            </button>
          ))}
        </div>
        <div className="mt-1.5 flex gap-1.5">
          {['serif', 'display', 'sans'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onTokenChange({ headlineFont: f })}
              className={`flex-1 rounded-md border px-2 py-1.5 text-[11px] capitalize transition-colors ${
                tokens.headlineFont === f ? 'border-foreground bg-accent' : 'border-border text-muted-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Block</p>
            <div className="flex items-center gap-0.5">
              <button type="button" onClick={() => onMove(selected.id, -1)} disabled={index <= 0} aria-label="Move up" className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30">
                <ArrowUp size={13} />
              </button>
              <button type="button" onClick={() => onMove(selected.id, 1)} disabled={index === blocks.length - 1} aria-label="Move down" className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30">
                <ArrowDown size={13} />
              </button>
              <button type="button" onClick={() => onDuplicate(selected.id)} aria-label="Duplicate" className="rounded p-1 text-muted-foreground hover:bg-accent">
                <Copy size={13} />
              </button>
              <button type="button" onClick={() => onDelete(selected.id)} aria-label="Delete" className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive">
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-2.5">
            {TEXT_KEYS.filter(([key]) => typeof selected.props?.[key] === 'string').map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
                <textarea
                  value={selected.props[key]}
                  onChange={(e) => onUpdateProps(selected.id, { [key]: e.target.value })}
                  rows={key === 'body' || key === 'subtitle' ? 3 : 1}
                  className="mt-1 w-full resize-none rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] leading-snug outline-none focus:border-foreground"
                />
              </label>
            ))}
            {selected.type === 'stats' && (
              <p className="text-[11px] text-muted-foreground">
                {(selected.props.items || []).length} proof points · ask the agent to change them in one line.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="border-b border-border px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Page SEO</p>
        <input
          value={seo.title || ''}
          onChange={(e) => onSeoChange({ title: e.target.value })}
          placeholder="Title tag"
          className="mt-2 w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] outline-none focus:border-foreground"
        />
        <textarea
          value={seo.description || ''}
          onChange={(e) => onSeoChange({ description: e.target.value })}
          placeholder="Meta description"
          rows={3}
          className="mt-1.5 w-full resize-none rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] outline-none focus:border-foreground"
        />
      </div>

      <div className="px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Insert block</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {BLOCK_LIBRARY.map((b) => (
            <button
              key={b.type}
              type="button"
              onClick={() => onAdd({ id: uid(b.type), type: b.type, props: DEFAULTS[b.type] || {} })}
              className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              title={b.hint}
            >
              <Plus size={11} /> {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-border px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Structure</p>
        <div className="mt-2 space-y-0.5">
          {blocks.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelect(b.id)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[11.5px] transition-colors ${
                b.id === selectedId ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/60'
              }`}
            >
              <span className="h-1 w-1 rounded-full bg-current opacity-50" />
              {BLOCK_LIBRARY.find((x) => x.type === b.type)?.label || b.type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}