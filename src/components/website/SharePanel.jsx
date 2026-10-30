import React, { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Link2, Loader2, Lock, Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EXPIRY = [
  { value: 0, label: 'No expiry' },
  { value: 24, label: 'Expires in 24 hours' },
  { value: 168, label: 'Expires in 7 days' },
  { value: 720, label: 'Expires in 30 days' },
];

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SharePanel({ taskId, websiteId, siteTitle, siteUrl }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [password, setPassword] = useState('');
  const [expiry, setExpiry] = useState(0);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const shareUrl = (token) => `${window.location.origin}/share/${token}`;

  const load = useCallback(async () => {
    const res = await base44.functions.invoke('shareLink', { action: 'list', task_id: taskId });
    setLinks(res.data.links || []);
  }, [taskId]);

  useEffect(() => {
    let live = true;
    load()
      .catch((err) => live && setError(err?.response?.data?.error || err.message))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [load]);

  const create = async (event) => {
    event.preventDefault();
    setBusy('create');
    setError('');
    try {
      const res = await base44.functions.invoke('shareLink', {
        action: 'create',
        task_id: taskId,
        website_id: websiteId || '',
        site_title: siteTitle || '',
        site_url: siteUrl || '',
        label: label.trim(),
        password: password.trim(),
        expires_in_hours: expiry,
      });
      setLinks((prev) => [res.data.link, ...prev]);
      setLabel('');
      setPassword('');
      setExpiry(0);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy('');
    }
  };

  const revoke = async (link) => {
    setBusy(link.id);
    setError('');
    try {
      await base44.functions.invoke('shareLink', { action: 'revoke', id: link.id });
      setLinks((prev) => prev.map((item) => (item.id === link.id ? { ...item, revoked: true } : item)));
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
        <Link2 size={12} className="text-muted-foreground" />
        <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Share &amp; access</p>
      </div>

      <form onSubmit={create} className="mt-2.5 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Label, e.g. Client review"
            aria-label="Share link label"
            className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] outline-none focus:border-foreground/30"
          />
          <select
            value={expiry}
            onChange={(event) => setExpiry(Number(event.target.value))}
            aria-label="Link expiry"
            className="rounded-full border border-border bg-background px-2 py-1.5 text-[11.5px] outline-none"
          >
            {EXPIRY.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Password (optional)"
            aria-label="Link password"
            className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] outline-none focus:border-foreground/30"
          />
          <button
            type="submit"
            disabled={busy === 'create'}
            className="glass-blue inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11.5px] font-medium disabled:opacity-60"
          >
            {busy === 'create' ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />} Create link
          </button>
        </div>
      </form>

      {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}

      {loading ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          <Loader2 size={11} className="animate-spin" /> Loading links…
        </p>
      ) : links.length === 0 ? (
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
          No share links yet. A link opens a read-only view of this site, without giving access to the workspace.
        </p>
      ) : (
        <ul className="mt-2.5 divide-y divide-border">
          {links.map((link) => {
            const url = shareUrl(link.token);
            return (
              <li key={link.id} className="py-2 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-[12px] font-medium">{link.label || 'Shared view'}</span>
                  {link.has_password && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-[1px] text-[10px] text-muted-foreground">
                      <Lock size={9} /> Password
                    </span>
                  )}
                  {link.revoked ? (
                    <span className="rounded-full border border-destructive/30 bg-destructive/10 px-1.5 py-[1px] text-[10px] font-medium text-destructive">
                      Off
                    </span>
                  ) : link.expires_at && new Date(link.expires_at).getTime() < Date.now() ? (
                    <span className="rounded-full border border-border bg-secondary px-1.5 py-[1px] text-[10px] text-muted-foreground">
                      Expired
                    </span>
                  ) : null}
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copy(url)}
                      disabled={link.revoked}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-[3px] text-[10.5px] transition-colors hover:bg-secondary disabled:opacity-50"
                    >
                      {copied === url ? <Check size={9} /> : <Copy size={9} />} {copied === url ? 'Copied' : 'Copy'}
                    </button>
                    {!link.revoked && (
                      <button
                        type="button"
                        onClick={() => revoke(link)}
                        disabled={busy === link.id}
                        aria-label={`Turn off link ${link.label || ''}`}
                        className="rounded-full border border-border p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive disabled:opacity-50"
                      >
                        {busy === link.id ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 truncate text-[10.5px] text-muted-foreground">{url}</p>
                <p className="text-[10.5px] text-muted-foreground">
                  {link.view_count || 0} view{link.view_count === 1 ? '' : 's'}
                  {link.last_viewed_at ? ` · last ${formatDate(link.last_viewed_at)}` : ''}
                  {link.expires_at ? ` · expires ${formatDate(link.expires_at)}` : ' · no expiry'}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}