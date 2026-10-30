import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, Loader2, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SharedView() {
  const { token } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [checking, setChecking] = useState(false);

  const resolve = useCallback(
    async (secret) => {
      const res = await base44.functions.invoke('shareLink', { action: 'resolve', token, password: secret || '' });
      setSite(res.data);
      setRequiresPassword(false);
      setError('');
    },
    [token],
  );

  useEffect(() => {
    let live = true;
    resolve()
      .catch((err) => {
        if (!live) return;
        const data = err?.response?.data || {};
        if (data.requires_password) {
          setRequiresPassword(true);
          setError(data.error || '');
          return;
        }
        setError(data.error || err.message);
      })
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [resolve]);

  const unlock = async (event) => {
    event.preventDefault();
    setChecking(true);
    try {
      await resolve(password);
    } catch (err) {
      const data = err?.response?.data || {};
      setError(data.error || err.message);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <form onSubmit={unlock} className="w-full max-w-[360px] rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Lock size={13} />
            <p className="text-[10.5px] uppercase tracking-wide">Protected link</p>
          </div>
          <h1 className="mt-2 font-heading text-[17px]">Enter the password</h1>
          <p className="mt-1 text-[11.5px] text-muted-foreground">The owner of this site protected it with a password.</p>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoFocus
            placeholder="Password"
            aria-label="Link password"
            className="mt-3 w-full rounded-full border border-border bg-background px-3 py-2 text-[12.5px] outline-none focus:border-foreground/30"
          />
          {error && <p className="mt-2 text-[11.5px] text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={checking || !password}
            className="glass-blue mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium disabled:opacity-60"
          >
            {checking ? <Loader2 size={12} className="animate-spin" /> : null} Open site
          </button>
        </form>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5 text-center">
        <div>
          <h1 className="font-heading text-[18px]">This link is not available</h1>
          <p className="mt-1 text-[12px] text-muted-foreground">{error || 'Ask the owner for a new link.'}</p>
        </div>
      </div>
    );
  }

  // A release handoff carries its own rendered pages, so the client needs no
  // account: each page opens on its own and the whole build is here to review.
  if (site.pages?.length) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border px-4 py-3">
          <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{site.title}</p>
              <p className="text-[10.5px] text-muted-foreground">
                {site.label ? `${site.label} · ` : ''}
                {site.pages.length} page{site.pages.length === 1 ? '' : 's'} for review
              </p>
            </div>
            {site.site_url && (
              <a
                href={site.site_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11.5px] transition-colors hover:bg-secondary"
              >
                Live site <ExternalLink size={10} />
              </a>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1080px] space-y-4 px-4 py-5">
          {site.pages.map((page) => (
            <section key={`${page.path}-${page.url}`} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-2">
                <p className="truncate text-[12px] font-medium">
                  {page.name}
                  <span className="ml-1.5 text-[10.5px] text-muted-foreground">{page.path}</span>
                </p>
                <a
                  href={page.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Open page <ExternalLink size={10} />
                </a>
              </div>
              <iframe
                title={page.name}
                src={page.url}
                className="h-[440px] w-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </section>
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium">{site.title}</p>
          <p className="text-[10.5px] text-muted-foreground">
            Read-only shared view{site.label ? ` · ${site.label}` : ''}
          </p>
        </div>
        {site.site_url && (
          <a
            href={site.site_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11.5px] transition-colors hover:bg-secondary"
          >
            Open site <ExternalLink size={10} />
          </a>
        )}
      </header>

      {site.site_url ? (
        <iframe
          title={site.title}
          src={site.site_url}
          className="min-h-0 flex-1 border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      ) : (
        <div className="grid flex-1 place-items-center px-5 text-center">
          <div>
            <h1 className="font-heading text-[18px]">Not published yet</h1>
            <p className="mt-1 text-[12px] text-muted-foreground">
              The site linked here has no live address yet. Check back once it is published.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}