import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import AdminGate from '@/components/video/AdminGate';
import useGuardian from '@/hooks/useGuardian';
import TrustHeader from '@/components/guardian/TrustHeader';
import ProbeGrid from '@/components/guardian/ProbeGrid';
import BenchmarkHistory from '@/components/guardian/BenchmarkHistory';
import FindingList from '@/components/guardian/FindingList';
import EvolveQueue from '@/components/guardian/EvolveQueue';

export default function Guardian() {
  const { user } = useAuth();
  const isAdmin = Boolean(user && user.role === 'admin');
  const { state, busy, error, verify, audit, heal, evolve, resolve } = useGuardian(isAdmin);
  const [note, setNote] = useState(null);

  const onVerify = async () => {
    const result = await verify();
    if (!result) return;
    setNote(
      result.regressions.length
        ? `${result.regressions.length} capability regressed: ${result.regressions.map((item) => item.probe_id).join(', ')}`
        : result.firstRun
          ? `Baseline recorded: ${result.score}% of probes pass.`
          : `No regression. ${result.score}% of probes pass${result.recovered.length ? `, ${result.recovered.length} recovered` : ''}.`,
    );
  };

  const onAudit = async () => {
    const result = await audit();
    if (result) setNote(`${result.findings.length} finding(s) in the records · ${result.opened} new · ${result.closed} cleared.`);
  };

  const onHeal = async (repair) => {
    const result = await heal(repair);
    if (result) setNote(result.note);
  };

  const onEvolve = async () => {
    const result = await evolve();
    if (result) setNote(`${result.created.length} brief(s) queued${result.skipped ? `, ${result.skipped} already waiting` : ''}.`);
  };

  if (user && !isAdmin) return <AdminGate />;

  return (
    <div className="mx-auto max-w-[880px] px-4 py-5 lg:px-6">
      <header className="flex flex-wrap items-baseline gap-2">
        <ShieldCheck size={15} className="text-muted-foreground" />
        <h1 className="font-heading text-[17px] tracking-tight">Guardian</h1>
        <span className="text-[11px] text-muted-foreground">verify · benchmark · audit · heal · evolve</span>
      </header>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
        The top-level check on everything else. Each probe makes the real call it claims to make, the run is signed,
        and anything that stops answering becomes a finding — then a brief.
      </p>

      {(error || note) && (
        <p className={`mt-2 text-[11px] ${error ? 'text-destructive' : 'text-muted-foreground'}`}>{error || note}</p>
      )}

      {!state ? (
        <p className="mt-4 text-[11.5px] text-muted-foreground">Reading the ledgers…</p>
      ) : (
        <div className="mt-3 space-y-3">
          <TrustHeader
            state={state}
            busy={busy}
            onVerify={onVerify}
            onAudit={onAudit}
            onEvolve={onEvolve}
          />

          <div className="grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
            <ProbeGrid catalog={state.catalog} run={state.latest} />
            <div className="space-y-3">
              <BenchmarkHistory runs={state.runs} checkpoints={state.checkpoints} />
              <FindingList
                findings={state.findings}
                resolved={state.resolved}
                busy={busy}
                healActions={state.healActions}
                onHeal={onHeal}
                onResolve={resolve}
              />
            </div>
          </div>

          <EvolveQueue jobs={state.jobs} />
        </div>
      )}
    </div>
  );
}