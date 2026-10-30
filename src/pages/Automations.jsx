import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Repeat } from 'lucide-react';
import AutomationCard from '@/components/automations/AutomationCard';
import AutomationDialog from '@/components/automations/AutomationDialog';
import AutomationDetailDialog from '@/components/automations/AutomationDetailDialog';

export default function Automations() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    const page = await base44.entities.Automation.filter({}, { sort: '-created_date', limit: 50 });
    setAutomations(page.items);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const toggle = async (automation) => {
    setAutomations((prev) =>
      prev.map((item) => (item.id === automation.id ? { ...item, enabled: !item.enabled } : item))
    );
    await base44.entities.Automation.update(automation.id, { enabled: !automation.enabled });
  };

  const runNow = async (automation) => {
    setBusyId(automation.id);
    setError('');
    try {
      const res = await base44.functions.invoke('runAutomations', { automation_id: automation.id });
      if (res.data?.task_url) window.open(res.data.task_url, '_blank', 'noreferrer');
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (automation) => {
    await base44.entities.Automation.delete(automation.id);
    setAutomations((prev) => prev.filter((item) => item.id !== automation.id));
    if (selectedId === automation.id) setSelectedId(null);
  };

  const selected = automations.find((item) => item.id === selectedId) || null;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-8 lg:px-10 lg:py-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[15px] font-medium">Automations</h1>
          <p className="mt-1.5 max-w-xl text-[11.5px] leading-relaxed text-muted-foreground">
            Recurring agent work. Each automation launches a task on its own schedule and time zone, so the brief runs
            without you opening the app.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="glass-blue flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium"
        >
          <Plus size={12} /> New
        </button>
      </div>

      {error && <p className="mt-4 text-[12px] text-destructive">{error}</p>}

      {loading ? (
        <div className="mt-6 grid place-items-center py-16">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        </div>
      ) : automations.length === 0 ? (
        <div className="mt-5 rounded-xl border border-border bg-card px-4 py-6 text-center">
          <Repeat size={18} className="mx-auto text-muted-foreground" />
          <p className="mt-2 text-[12.5px] font-medium">No automations yet</p>
          <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed text-muted-foreground">
            Schedule a recurring brief, a weekly scan, or an hourly watch, and it runs on its own.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {automations.map((automation) => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              busy={busyId === automation.id}
              onToggle={toggle}
              onRun={runNow}
              onDelete={remove}
              onOpen={(item) => setSelectedId(item.id)}
            />
          ))}
        </div>
      )}

      <AutomationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(created) => setAutomations((prev) => [created, ...prev])}
      />

      <AutomationDetailDialog
        automation={selected}
        open={Boolean(selected)}
        onOpenChange={(next) => {
          if (!next) setSelectedId(null);
        }}
        onRun={runNow}
        busy={busyId === selected?.id}
      />
    </div>
  );
}