import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import PlaybookCard from '@/components/playbooks/PlaybookCard';
import PlaybookDialog from '@/components/playbooks/PlaybookDialog';
import { PLAYBOOKS, PLAYBOOK_CATEGORIES } from '@/lib/playbooks';

export default function Playbooks() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return PLAYBOOKS.filter(
      (playbook) =>
        (category === 'all' || playbook.category === category) &&
        (!term || `${playbook.name} ${playbook.summary} ${playbook.steps.join(' ')}`.toLowerCase().includes(term))
    );
  }, [query, category]);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-[15px] font-medium">Playbooks</h1>
        <p className="text-[11.5px] text-muted-foreground">{PLAYBOOKS.length} recipes</p>
      </div>
      <p className="mt-1.5 max-w-[64ch] text-[11.5px] leading-relaxed text-muted-foreground">
        Repeatable ways of working. Run one as a task, or save it as an agent that carries the same steps into every
        session.
      </p>

      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2">
        <Search size={15} className="shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search playbooks"
          aria-label="Search playbooks"
          className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="shrink-0 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {[{ key: 'all', label: 'All' }, ...PLAYBOOK_CATEGORIES].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              category === key ? 'glass-blue' : 'glass-frost text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-12 text-center text-[12.5px] text-muted-foreground">
          Nothing matches that search. Try a different word.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((playbook) => (
            <PlaybookCard key={playbook.key} playbook={playbook} onOpen={setSelected} />
          ))}
        </div>
      )}

      <PlaybookDialog
        playbook={selected}
        open={Boolean(selected)}
        onOpenChange={(next) => {
          if (!next) setSelected(null);
        }}
      />
    </div>
  );
}