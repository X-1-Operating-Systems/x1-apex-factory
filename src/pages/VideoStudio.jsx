import React, { useEffect, useState } from 'react';
import { Clapperboard } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { callVideo, listOf, payloadOf } from '@/lib/videoApi';
import BalanceCard from '@/components/video/BalanceCard';
import RenderForm from '@/components/video/RenderForm';
import JobRow from '@/components/video/JobRow';
import CapabilityTable from '@/components/video/CapabilityTable';
import AdminGate from '@/components/video/AdminGate';

export default function VideoStudio() {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [groups, setGroups] = useState([]);
  const [voices, setVoices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadJobs = async () => {
    const page = await base44.entities.VideoJob.filter({ provider: 'heygen' }, { sort: '-created_date', limit: 25 });
    setJobs(page.items || []);
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    (async () => {
      const [accountRes, avatarRes, voiceRes, capRes] = await Promise.all([
        callVideo('heygen', 'account.me'),
        callVideo('heygen', 'avatars.list', { limit: 50 }),
        callVideo('heygen', 'voices.list', { limit: 50 }),
        callVideo('heygen', 'registry.list'),
      ]);
      if (accountRes.ok) setAccount(payloadOf(accountRes));
      if (!avatarRes.ok) setError(avatarRes.error || 'HeyGen did not answer.');
      setGroups(listOf(avatarRes));
      setVoices(listOf(voiceRes));
      setCapabilities(payloadOf(capRes) || []);
      await loadJobs().catch(() => {});
    })().finally(() => setLoading(false));
  }, [user]);

  // A render that is still in flight is polled until it lands, so a finished video appears
  // without anyone pressing Status.
  useEffect(() => {
    const pending = jobs
      .filter((job) => !job.video_url && ['submitted', 'processing', 'waiting', 'pending'].includes(String(job.status || '').toLowerCase()))
      .slice(0, 5);
    if (!pending.length) return undefined;
    const timer = window.setInterval(async () => {
      await Promise.all(pending.map((job) => callVideo('heygen', 'videos.get', { video_id: job.job_id })));
      await loadJobs().catch(() => {});
    }, 20000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  if (user && user.role !== 'admin') return <AdminGate />;

  return (
    <div className="mx-auto max-w-[880px] px-4 py-5 lg:px-6">
      <header className="flex items-center gap-2">
        <Clapperboard size={15} className="text-muted-foreground" />
        <h1 className="font-heading text-[17px] tracking-tight">Video studio</h1>
        <span className="text-[11px] text-muted-foreground">HeyGen v3</span>
      </header>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
        Avatar renders from a script, with the account&apos;s own avatars and voices. Every render is
        stored here with its status and result.
      </p>

      <div className="mt-3">
        <BalanceCard account={account} loading={loading} />
      </div>

      {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
        <RenderForm groups={groups} voices={voices} onCreated={loadJobs} />

        <section className="rounded-lg border border-border bg-card">
          <header className="border-b border-border px-3.5 py-2.5">
            <h2 className="font-heading text-[13px] tracking-tight">Renders</h2>
            <p className="text-[10.5px] text-muted-foreground">{jobs.length} stored on this workspace</p>
          </header>
          {loading && !jobs.length ? (
            <p className="px-3.5 py-4 text-[11px] text-muted-foreground">Loading…</p>
          ) : jobs.length ? (
            <div className="max-h-[420px] overflow-y-auto scroll-thin">
              {jobs.map((job) => (
                <JobRow key={job.id} job={job} onRefreshed={loadJobs} />
              ))}
            </div>
          ) : (
            <p className="px-3.5 py-4 text-[11px] leading-relaxed text-muted-foreground">
              Nothing rendered yet. Pick an avatar, write a script, and the first render lands here.
            </p>
          )}
        </section>
      </div>

      <CapabilityTable entries={capabilities} />
    </div>
  );
}