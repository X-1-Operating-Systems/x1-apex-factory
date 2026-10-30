import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search as SearchIcon, Sparkles } from 'lucide-react';
import SearchResults from '@/components/search/SearchResults';
import AIChat from '@/components/ai/AIChat';
import useStudioChat from '@/hooks/useStudioChat';
import { loadTaskOptions, saveTaskOptions } from '@/lib/taskOptions';
import { SEARCH_SECTIONS } from '@/lib/search';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') || '');
  const query = (params.get('q') || '').trim();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [moreBusy, setMoreBusy] = useState('');
  const [error, setError] = useState('');
  const [chatOptions, setChatOptions] = useState(() => loadTaskOptions());
  const chat = useStudioChat({ model: chatOptions.model, effort: chatOptions.effort });

  const changeChatOptions = (next) => {
    setChatOptions(next);
    saveTaskOptions(next);
  };

  useEffect(() => {
    if (!query) {
      setSections([]);
      return undefined;
    }
    let live = true;
    setLoading(true);
    setError('');
    Promise.all(
      SEARCH_SECTIONS.map((section) =>
        section
          .run(query, { limit: section.limit })
          .then((page) => ({
            key: section.key,
            title: section.title,
            items: page.items || [],
            cursor: page.next_cursor || null,
            has_more: Boolean(page.has_more),
          }))
          .catch(() => ({ key: section.key, title: section.title, items: [], cursor: null, has_more: false }))
      )
    )
      .then((next) => {
        if (!live) return;
        setSections(next);
        setLoading(false);
      })
      .catch((err) => {
        if (!live) return;
        setError(err?.response?.data?.error || err.message);
        setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [query]);

  const more = async (key) => {
    const current = sections.find((section) => section.key === key);
    const spec = SEARCH_SECTIONS.find((section) => section.key === key);
    if (!current?.cursor || !spec || moreBusy) return;
    setMoreBusy(key);
    try {
      const page = await spec.run(query, { limit: spec.limit, cursor: current.cursor });
      setSections((prev) =>
        prev.map((section) =>
          section.key !== key
            ? section
            : {
                ...section,
                items: [...section.items, ...(page.items || [])],
                cursor: page.next_cursor || null,
                has_more: Boolean(page.has_more),
              }
        )
      );
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setMoreBusy('');
    }
  };

  const total = sections.reduce((sum, section) => sum + section.items.length, 0);
  const anyMore = sections.some((section) => section.has_more);

  const submit = (event) => {
    event.preventDefault();
    setParams(term.trim() ? { q: term.trim() } : {});
  };

  return (
    <div className="mx-auto w-full max-w-[900px] px-5 py-8 lg:px-10 lg:py-10">
      <h1 className="text-[15px] font-medium">Ask or search</h1>

      <div className="mt-3 flex h-[320px] flex-col rounded-xl border border-border bg-card p-3">
        <div className="mb-1.5 flex shrink-0 items-center gap-1.5">
          <Sparkles size={12} className="text-muted-foreground" />
          <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Ask the studio</p>
        </div>
        <AIChat
          chat={chat}
          options={chatOptions}
          onOptionsChange={changeChatOptions}
          placeholder={query ? `Ask about “${query}”` : 'Describe what you want built'}
          hint="The fastest way in: describe the build and it starts as a real task. Results for what already exists sit below."
        />
      </div>

      <form onSubmit={submit} className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <SearchIcon size={14} className="shrink-0 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          autoFocus
          placeholder="Search tasks, projects, websites, artifacts, files, agents"
          aria-label="Search everything"
          className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-muted-foreground"
        />
        <span className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
          ⌘K
        </span>
      </form>

      {loading && (
        <div className="mt-8 grid place-items-center py-10">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && error && <p className="mt-6 text-[12px] text-destructive">{error}</p>}

      {!loading && !query && (
        <p className="mt-8 text-[12px] text-muted-foreground">
          Type a term and press enter. Results are grouped by workspace surface, and each one pages on its own.
        </p>
      )}

      {!loading && (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          This index covers studio tasks, projects, websites, artifacts, files, agents, automations and templates.
          Runs made on a connected Manus account are listed and filtered in Tasks, not here.
        </p>
      )}

      {!loading && query && total === 0 && (
        <p className="mt-8 text-[12px] text-muted-foreground">
          Nothing matched “{query}”. Try a shorter term.
        </p>
      )}

      {!loading && total > 0 && (
        <>
          <p className="mt-4 text-[11px] text-muted-foreground">
            {total} loaded{anyMore ? ' · more available in some surfaces' : ''}
          </p>
          <SearchResults sections={sections} onMore={more} moreBusy={moreBusy} />
        </>
      )}
    </div>
  );
}