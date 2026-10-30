import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plug, Search } from 'lucide-react';
import ConnectorCard from '@/components/plugins/ConnectorCard';
import ConnectorDialog from '@/components/plugins/ConnectorDialog';
import { CATEGORY_ORDER, CONNECTORS, connectorByKey } from '@/lib/connectorCatalog';

export default function Plugins() {
  const [records, setRecords] = useState([]);
  const [tab, setTab] = useState('marketplace');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedKey, setSelectedKey] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const page = await base44.entities.StudioConnector.filter({}, { sort: '-created_date', limit: 200 });
    setRecords(page.items);
  };

  useEffect(() => {
    load()
      .catch((err) => setError(err?.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  const recordByKey = useMemo(() => {
    const map = {};
    for (const record of records) map[record.key] = record;
    return map;
  }, [records]);

  const installedKeys = useMemo(() => new Set(records.map((record) => record.key)), [records]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const base =
      tab === 'installed' ? CONNECTORS.filter((item) => installedKeys.has(item.key)) : CONNECTORS;
    return base.filter(
      (item) =>
        (category === 'all' || item.category === category) &&
        (!term || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(term))
    );
  }, [tab, query, category, installedKeys]);

  const connect = async (connector) => {
    setBusy(true);
    setError('');
    try {
      const created = await base44.entities.StudioConnector.create({
        key: connector.key,
        name: connector.name,
        category: connector.category,
        access: 'read_write',
        auto_approve: false,
        installed_at: new Date().toISOString(),
      });
      setRecords((prev) => [created, ...prev]);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  const update = async (record, patch) => {
    setBusy(true);
    setRecords((prev) => prev.map((item) => (item.id === record.id ? { ...item, ...patch } : item)));
    try {
      await base44.entities.StudioConnector.update(record.id, patch);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
      await load().catch(() => {});
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async (record) => {
    setBusy(true);
    try {
      await base44.entities.StudioConnector.delete(record.id);
      setRecords((prev) => prev.filter((item) => item.id !== record.id));
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  const selected = connectorByKey(selectedKey);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[15px] font-medium">Connectors</h1>
        <p className="text-[11.5px] text-muted-foreground">{records.length} installed</p>
      </div>
      <p className="mt-1.5 max-w-[62ch] text-[11.5px] leading-relaxed text-muted-foreground">
        The tools your agents may call. Installing one sets its access level and whether runs must ask before using it.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-border bg-card p-0.5">
          {[
            ['marketplace', 'Marketplace'],
            ['installed', `Installed (${records.length})`],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                tab === key ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex min-w-[190px] flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5">
          <Search size={13} className="shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search connectors"
            aria-label="Search connectors"
            className="w-full bg-transparent text-[12px] outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {['all', ...CATEGORY_ORDER].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              category === key ? 'glass-blue' : 'glass-frost text-muted-foreground hover:text-foreground'
            }`}
          >
            {key === 'all' ? 'All' : key}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-[12px] text-destructive">{error}</p>}

      {loading ? (
        <div className="mt-6 grid place-items-center py-16">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-5 rounded-xl border border-border bg-card px-4 py-6 text-center">
          <Plug size={18} className="mx-auto text-muted-foreground" />
          <p className="mt-2 text-[12.5px] font-medium">
            {tab === 'installed' ? 'Nothing installed yet' : 'No connectors match'}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed text-muted-foreground">
            {tab === 'installed'
              ? 'Pick a service from the marketplace and it appears here with its permissions.'
              : 'Try another search or category.'}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((connector) => (
            <ConnectorCard
              key={connector.key}
              connector={connector}
              record={recordByKey[connector.key]}
              onOpen={(item) => setSelectedKey(item.key)}
            />
          ))}
        </div>
      )}

      <ConnectorDialog
        connector={selected}
        record={selected ? recordByKey[selected.key] : null}
        open={Boolean(selected)}
        onOpenChange={(next) => {
          if (!next) setSelectedKey(null);
        }}
        onConnect={connect}
        onDisconnect={disconnect}
        onUpdate={update}
        busy={busy}
      />
    </div>
  );
}