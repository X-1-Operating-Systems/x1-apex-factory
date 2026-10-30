import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Bot, Loader2, Plus } from 'lucide-react';
import AgentFormDialog from '@/components/agents/AgentFormDialog';
import RunAgentDialog from '@/components/agents/RunAgentDialog';
import StudioAgentCard from '@/components/agents/StudioAgentCard';
import AgentCard from '@/components/manus/AgentCard';

export default function Agents() {
  const { toast } = useToast();
  const [agents, setAgents] = useState([]);
  const [manus, setManus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [runAgent, setRunAgent] = useState(null);

  const load = async () => {
    const page = await base44.entities.StudioAgent.list('-created_date', 50);
    setAgents(page);
  };

  useEffect(() => {
    let live = true;
    const boot = async () => {
      try {
        const [page, connected] = await Promise.all([
          base44.entities.StudioAgent.list('-created_date', 50),
          base44.functions.invoke('manusAgent', { action: 'agents' }),
        ]);
        if (!live) return;
        setAgents(page);
        setManus(connected.data.agents || []);
      } catch (err) {
        if (!live) return;
        setError(err?.response?.data?.error || err.message);
      } finally {
        if (live) setLoading(false);
      }
    };
    boot();
    return () => {
      live = false;
    };
  }, []);

  const save = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        await base44.entities.StudioAgent.update(editing.id, values);
      } else {
        await base44.entities.StudioAgent.create(values);
      }
      await load();
      setFormOpen(false);
      setEditing(null);
      toast({ title: editing ? 'Agent updated' : 'Agent created' });
    } catch (err) {
      toast({ title: 'Could not save the agent', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (agent) => {
    await base44.entities.StudioAgent.delete(agent.id);
    await load();
    toast({ title: 'Agent deleted' });
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] px-5 py-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-[15px] font-medium">Agents</h1>
          <p className="mt-1.5 max-w-[64ch] text-[11.5px] leading-relaxed text-muted-foreground">
            Saved specialists. Each keeps its own standing instructions, so every run starts from the same brief instead
            of retyping it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="glass-blue inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium"
        >
          <Plus size={13} /> New agent
        </button>
      </div>

      {error && <p className="mt-6 text-[12.5px] text-destructive">{error}</p>}

      {agents.length === 0 ? (
        <div className="mt-5 rounded-xl border border-border bg-card px-4 py-8 text-center">
          <Bot size={18} className="mx-auto text-muted-foreground" />
          <p className="mt-2 text-[12.5px] font-medium">No agents yet</p>
          <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed text-muted-foreground">
            Create one for the work you repeat — landing pages, audits, launches — then run it on any client.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {agents.map((agent) => (
            <StudioAgentCard
              key={agent.id}
              agent={agent}
              onRun={setRunAgent}
              onEdit={(item) => {
                setEditing(item);
                setFormOpen(true);
              }}
              onDelete={remove}
            />
          ))}
        </div>
      )}

      {manus.length > 0 && (
        <div className="mt-8">
          <p className="text-[11.5px] font-medium">Connected Manus agents</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Custom agents on your Manus account, each with its own thread.</p>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            {manus.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

      <AgentFormDialog
        open={formOpen}
        onOpenChange={(next) => {
          setFormOpen(next);
          if (!next) setEditing(null);
        }}
        agent={editing}
        onSubmit={save}
        busy={saving}
      />

      <RunAgentDialog open={Boolean(runAgent)} onOpenChange={(next) => !next && setRunAgent(null)} agent={runAgent || {}} onRan={load} />
    </div>
  );
}