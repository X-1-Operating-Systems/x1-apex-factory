import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Monitor, Rocket } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import VersionList from '@/components/website/VersionList';
import VersionActivity from '@/components/website/VersionActivity';
import DomainPanel from '@/components/website/DomainPanel';

const TONE = {
  published: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  publishing: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  failed: 'bg-destructive/10 text-destructive border-destructive/30',
  unpublished: 'bg-secondary text-muted-foreground border-border',
};

export default function WebsiteDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibility, setVisibility] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [rollingBackId, setRollingBackId] = useState('');

  const load = useCallback(async () => {
    const [statusRes, historyRes] = await Promise.all([
      base44.functions.invoke('manusAgent', { action: 'website', task_id: taskId }),
      base44.functions.invoke('manusAgent', { action: 'checkpoints', task_id: taskId }),
    ]);
    setSite(statusRes.data);
    setHistory(historyRes.data);
  }, [taskId]);

  useEffect(() => {
    let live = true;
    load()
      .catch((err) => {
        if (live) setError(err?.response?.data?.error || err.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [load]);

  const publish = async () => {
    setPublishing(true);
    setError('');
    try {
      await base44.functions.invoke('manusAgent', {
        action: 'publish',
        task_id: taskId,
        visibility: visibility || site?.visibility || 'public',
      });
      for (let i = 0; i < 6; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const res = await base44.functions.invoke('manusAgent', { action: 'website', task_id: taskId });
        setSite(res.data);
        if (res.data.publish_status === 'published' || res.data.publish_status === 'failed') break;
      }
      const refreshed = await base44.functions.invoke('manusAgent', { action: 'checkpoints', task_id: taskId });
      setHistory(refreshed.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setPublishing(false);
    }
  };

  const rollback = async (checkpoint) => {
    setRollingBackId(checkpoint.version_id);
    setError('');
    try {
      await base44.functions.invoke('manusAgent', {
        action: 'send',
        task_id: taskId,
        message: `Roll this website back to version ${checkpoint.version_id}${
          checkpoint.message ? ` (${checkpoint.message})` : ''
        }. Restore that checkpoint's content, then publish it.`,
      });
      navigate(`/task/${taskId}`);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
      setRollingBackId('');
    }
  };

  if (loading) {
    return (
      <div className="grid h-full place-items-center py-24">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tone = TONE[site?.publish_status] || TONE.unpublished;
  const previewLive = site?.preview_url && site?.sandbox_status === 'running';

  return (
    <div className="mx-auto w-full max-w-[820px] px-5 py-6 lg:px-10">
      <Link
        to="/websites"
        className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={12} /> Websites
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-[15px] font-medium">
            <span className="truncate">{site?.title || 'Website'}</span>
            <span className={`shrink-0 rounded-full border px-1.5 py-[1px] text-[10px] font-medium ${tone}`}>
              {site?.publish_status === 'published' ? 'Live' : site?.publish_status || 'Unpublished'}
            </span>
          </h1>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {site?.visibility ? `${site.visibility} · ` : ''}
            {history?.checkpoints?.length || 0} version{(history?.checkpoints?.length || 0) === 1 ? '' : 's'}
            {site?.sandbox_status ? ` · sandbox ${site.sandbox_status}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <select
            value={visibility || site?.visibility || 'public'}
            onChange={(e) => setVisibility(e.target.value)}
            aria-label="Publish visibility"
            className="rounded-full border border-border bg-card px-2 py-1 text-[11px] outline-none"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="team">Team</option>
          </select>
          <button
            type="button"
            onClick={publish}
            disabled={publishing}
            className="glass-blue inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-medium disabled:opacity-60"
          >
            {publishing ? <Loader2 size={11} className="animate-spin" /> : <Rocket size={11} />}
            {publishing ? 'Deploying' : 'Publish latest'}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {site?.site_url && (
          <a
            href={site.site_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11.5px] transition-colors hover:bg-secondary"
          >
            Open live site <ExternalLink size={10} />
          </a>
        )}
        {previewLive && (
          <a
            href={site.preview_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Monitor size={10} /> Sandbox preview
          </a>
        )}
      </div>

      {error && <p className="mt-3 text-[11.5px] text-destructive">{error}</p>}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <DomainPanel taskId={taskId} websiteId={site?.website_id} siteUrl={site?.site_url} />
        <VersionActivity
          checkpoints={history?.checkpoints || []}
          publishedVersionId={history?.published_version_id || site?.published_version_id}
        />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-[10.5px] uppercase tracking-wide text-muted-foreground">Version history</p>
        <VersionList
          checkpoints={history?.checkpoints || []}
          publishedVersionId={history?.published_version_id}
          onRollback={rollback}
          rollingBackId={rollingBackId}
        />
        <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground">
          Rolling back asks the agent to restore that checkpoint's content and publish it, so the site returns to that
          version.
        </p>
      </div>
    </div>
  );
}