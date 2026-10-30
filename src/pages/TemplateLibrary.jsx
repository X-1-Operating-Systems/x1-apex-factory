import React, { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TemplateCard from '@/components/TemplateCard';
import TemplatePreviewDialog from '@/components/templates/TemplatePreviewDialog';
import NewProjectDialog from '@/components/NewProjectDialog';

const PAGE = 24;

const CATEGORIES = [
  ['all', 'All'],
  ['saas', 'SaaS'],
  ['agency', 'Agency'],
  ['local_service', 'Local service'],
  ['restaurant', 'Restaurant'],
  ['portfolio', 'Portfolio'],
  ['commerce', 'Commerce'],
  ['real_estate', 'Real estate'],
  ['clinic', 'Clinic'],
  ['fitness', 'Fitness'],
  ['professional', 'Professional'],
  ['event', 'Event'],
  ['editorial', 'Editorial'],
];

function buildQuery(category, term) {
  const q = {};
  if (category !== 'all') q.category = category;
  if (term) {
    const rx = { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    q.$or = [{ name: rx }, { tagline: rx }, { description: rx }];
  }
  return q;
}

export default function TemplateLibrary() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [moreBusy, setMoreBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preset, setPreset] = useState('');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => setTerm(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    let live = true;
    const run = async () => {
      setLoading(true);
      const q = buildQuery(category, term);
      const [page, count] = await Promise.all([
        base44.entities.Template.filter(q, { sort: 'display_order', limit: PAGE }),
        base44.entities.Template.count(q),
      ]);
      if (!live) return;
      setItems(page.items);
      setCursor(page.next_cursor || null);
      setHasMore(Boolean(page.has_more));
      setTotal(count);
      setLoading(false);
    };
    run();
    return () => {
      live = false;
    };
  }, [category, term]);

  useEffect(() => {
    const run = async () => {
      const { rows } = await base44.entities.Template.aggregate({ groupBy: 'category' });
      setCounts(Object.fromEntries(rows.map((r) => [r.category, r.count])));
    };
    run();
  }, []);

  const libraryTotal = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

  const loadMore = async () => {
    if (!cursor || moreBusy) return;
    setMoreBusy(true);
    const page = await base44.entities.Template.filter(buildQuery(category, term), {
      sort: 'display_order',
      limit: PAGE,
      cursor,
    });
    setItems((prev) => [...prev, ...page.items]);
    setCursor(page.next_cursor || null);
    setHasMore(Boolean(page.has_more));
    setMoreBusy(false);
  };

  const use = (template) => {
    setPreset(template.id);
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-8 lg:px-10 lg:py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-[15px] font-medium">Templates</h1>
        <p className="text-[12px] text-muted-foreground">
          {libraryTotal ? `${libraryTotal} structures across 12 industries` : 'Loading library'}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
        <Search size={16} className="shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by industry, name or positioning"
          aria-label="Search templates"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="shrink-0 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {CATEGORIES.map(([key, label]) => {
          const active = category === key;
          const n = key === 'all' ? libraryTotal : counts[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
                active ? 'glass-blue' : 'glass-frost text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
              {n ? <span className={`text-[10px] ${active ? 'text-white/75' : 'text-muted-foreground/80'}`}>{n}</span> : null}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[220px] animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-12 text-center text-[12.5px] text-muted-foreground">
          Nothing matches that search. Try an industry name or a different word.
        </p>
      ) : (
        <>
          <p className="mt-5 text-[11.5px] text-muted-foreground">
            Showing {items.length} of {total}
          </p>
          <div className="mt-3 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <TemplateCard key={t.id} template={t} onUse={use} onPreview={setPreview} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={moreBusy}
                className="glass-frost rounded-full px-5 py-2 text-[12px] font-medium disabled:opacity-50"
              >
                {moreBusy ? 'Loading…' : `Load ${Math.min(PAGE, total - items.length)} more`}
              </button>
            </div>
          )}
        </>
      )}

      <TemplatePreviewDialog
        template={preview}
        open={Boolean(preview)}
        onOpenChange={(next) => {
          if (!next) setPreview(null);
        }}
        onUse={(template) => {
          setPreview(null);
          use(template);
        }}
      />

      <NewProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        templates={items}
        initialTemplateId={preset}
      />
    </div>
  );
}