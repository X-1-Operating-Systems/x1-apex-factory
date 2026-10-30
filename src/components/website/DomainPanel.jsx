import React, { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Globe, Loader2, Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TONE = {
  verified: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  failed: 'bg-destructive/10 text-destructive border-destructive/30',
};

export default function DomainPanel({ taskId, websiteId, siteUrl }) {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hostname, setHostname] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const target = React.useMemo(() => {
    try {
      return siteUrl ? new URL(siteUrl).hostname : '';
    } catch {
      return '';
    }
  }, [siteUrl]);

  const load = useCallback(async () => {
    const page = await base44.entities.SiteDomain.filter({ task_id: taskId }, { sort: '-created_date', limit: 20 });
    setDomains(page.items);
  }, [taskId]);

  useEffect(() => {
    let live = true;
    load()
      .catch((err) => live && setError(err.message))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [load]);

  const add = async (event) => {
    event.preventDefault();
    const value = hostname.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!value) return;
    setBusy('add');
    setError('');
    try {
      const created = await base44.entities.SiteDomain.create({
        task_id: taskId,
        website_id: websiteId || '',
        hostname: value,
        target,
        status: 'pending',
      });
      setDomains((prev) => [created, ...prev]);
      setHostname('');
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy('');
    }
  };

  const verify = async (domain) => {
    setBusy(domain.id);
    setError('');
    try {
      const res = await base44.functions.invoke('siteDomain', { hostname: domain.hostname, target: domain.target || target });
      const data = res.data;
      const status = data.matches ? 'verified' : 'failed';
      const updated = await base44.entities.SiteDomain.update(domain.id, {
        status,
        detail: data.detail || '',
        last_checked_at: new Date().toISOString(),
        ...(status === 'verified' ? { verified_at: new Date().toISOString() } : {}),
      });
      setDomains((prev) => prev.map((item) => (item.id === domain.id ? updated : item)));
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy('');
    }
  };

  const remove = async (domain) => {
    setBusy(domain.id);
    try {
      await base44.entities.SiteDomain.delete(domain.id);
      setDomains((prev) => prev.filter((item) => item.id !== domain.id));
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy('');
    }
  };

  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      setCopied('');
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-center gap-1.5">
        <Globe size={12} className="text-muted-foreground" />
        <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Custom domain</p>
      </div>

      <form onSubmit={add} className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <input
          value={hostname}
          onChange={(event) => setHostname(event.target.value)}
          placeholder="www.yourbrand.com"
          aria-label="Custom domain"
          className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] outline-none focus:border-foreground/30"
        />
        <button
          type="submit"
          disabled={busy === 'add' || !hostname.trim()}
          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-[11.5px] transition-colors hover:bg-secondary disabled:opacity-50"
        >
          {busy === 'add' ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />} Add
        </button>
      </form>

      {target && (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Point a CNAME record at{' '}
          <button
            type="button"
            onClick={() => copy(target)}
            className="inline-flex items-center gap-1 underline underline-offset-2"
          >
            {target} {copied === target ? <Check size={9} /> : <Copy size={9} />}
          </button>
          , then verify.
        </p>
      )}

      {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}

      {loading ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          <Loader2 size={11} className="animate-spin" /> Checking domains…
        </p>
      ) : domains.length === 0 ? (
        <p className="mt-2 text-[11.5px] text-muted-foreground">
          No custom domain yet. The published site stays on its provider URL until one verifies.
        </p>
      ) : (
        <ul className="mt-2.5 divide-y divide-border">
          {domains.map((domain) => {
            const tone = TONE[domain.status] || TONE.pending;
            return (
              <li key={domain.id} className="py-2 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-[12px] font-medium">{domain.hostname}</span>
                  <span className={`rounded-full border px-1.5 py-[1px] text-[10px] font-medium ${tone}`}>
                    {domain.status}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => verify(domain)}
                      disabled={busy === domain.id}
                      className="rounded-full border border-border px-2 py-[3px] text-[10.5px] transition-colors hover:bg-secondary disabled:opacity-50"
                    >
                      {busy === domain.id ? 'Checking' : 'Verify DNS'}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(domain)}
                      disabled={busy === domain.id}
                      aria-label={`Remove ${domain.hostname}`}
                      className="rounded-full border border-border p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
                {domain.detail && (
                  <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">{domain.detail}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}