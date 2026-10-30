import React, { useEffect, useRef, useState } from 'react';
import { Rocket } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import AdminGate from '@/components/video/AdminGate';
import CommandBox from '@/components/autopilot/CommandBox';
import JobCard from '@/components/autopilot/JobCard';

const ACTIVE = ['queued', 'running'];

export default function Autopilot() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [command, setCommand] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const working = useRef(false);

  const activeJob = jobs.find((job) => ACTIVE.includes(job.status));

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    base44.functions
      .invoke('autopilot', { action: 'list' })
      .then((res) => setJobs(res.data?.jobs || []))
      .catch((err) => setError(err?.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!activeJob) return undefined;
    const timer = setInterval(async () => {
      if (working.current) return;
      working.current = true;
      try {
        const res = await base44.functions.invoke('autopilot', { action: 'tick', job_id: activeJob.id });
        const job = res.data?.advanced?.[0];
        if (job) setJobs((prev) => prev.map((entry) => (entry.id === job.id ? job : entry)));
      } catch (err) {
        setError(err?.response?.data?.error || err.message);
      } finally {
        working.current = false;
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [activeJob?.id, activeJob?.status]);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('autopilot', { action: 'start', command });
      if (res.data?.job) {
        setJobs((prev) => [res.data.job, ...prev]);
        setCommand('');
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusy(false);
    }
  };

  const stop = async (job) => {
    const res = await base44.functions.invoke('autopilot', { action: 'stop', job_id: job.id });
    if (res.data?.job) setJobs((prev) => prev.map((entry) => (entry.id === job.id ? res.data.job : entry)));
  };

  if (user && user.role !== 'admin') return <AdminGate />;

  return (
    <div className="mx-auto max-w-[880px] px-4 py-5 lg:px-6">
      <header className="flex flex-wrap items-center gap-2">
        <Rocket size={15} className="text-muted-foreground" />
        <h1 className="font-heading text-[17px] tracking-tight">Autopilot</h1>
        <span className="text-[11px] text-muted-foreground">plan · build · ceiling · ship · verify</span>
      </header>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
        Every job runs to the end on its own: the ceiling gate sends a page back to be rebuilt when it fails,
        an approved release deploys, and a real browser opens the live site to check it.
      </p>

      {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}

      <div className="mt-3">
        <CommandBox value={command} onChange={setCommand} onRun={run} busy={busy} />
      </div>

      <div className="mt-3 space-y-2.5">
        {loading && <p className="text-[11px] text-muted-foreground">Loading jobs…</p>}
        {!loading && jobs.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-3.5 py-6 text-center text-[11.5px] text-muted-foreground">
            No jobs yet. A command above becomes a planned site, shipped and checked without another click.
          </p>
        )}
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onStop={stop} />
        ))}
      </div>
    </div>
  );
}