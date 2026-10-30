import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import AgentPresetCard from '@/components/agents/AgentPresetCard';
import { AGENT_CATEGORIES, AGENT_PRESETS } from '@/lib/agentPresets';

export default function AgentStore({ agents, onInstall, installingId }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const installed = useMemo(
    () => new Set(agents.map((agent) => agent.installed_from || agent.id)),
    [agents]
  );

  const presets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return AGENT_PRESETS.filter((preset) => category === 'all' || preset.category === category).filter(
      (preset) =>
        !needle ||
        `${preset.name} ${preset.role} ${preset.instructions}`.toLowerCase().includes(needle)
    );
  }, [query, category]);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the store"
            className="h-8 w-full rounded-full border border-border bg-card pl-7 pr-3 text-[12px] outline-none placeholder:text-muted-foreground focus:border-foreground/25"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {[{ id: 'all', label: 'All' }, ...AGENT_CATEGORIES].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                category === item.id
                  ? 'border-foreground/20 bg-secondary text-foreground'
                  : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {presets.length === 0 ? (
        <p className="mt-6 text-[11.5px] text-muted-foreground">No persona matches that search.</p>
      ) : (
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {presets.map((preset) => (
            <AgentPresetCard
              key={preset.id}
              preset={preset}
              installed={installed.has(preset.id)}
              busy={installingId === preset.id}
              onInstall={onInstall}
            />
          ))}
        </div>
      )}
    </div>
  );
}