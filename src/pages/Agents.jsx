import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Loader2 } from 'lucide-react';
import AgentCard from '@/components/manus/AgentCard';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const res = await base44.functions.invoke('manusAgent', { action: 'agents' });
        if (live) setAgents(res.data.agents || []);
      } catch (err) {
        if (live) setError(err?.response?.data?.error || err.message);
      } finally {
        if (live) setLoading(false);
      }
    };
    load();
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1000px] px-5 py-8 lg:px-10 lg:py-10">
      <h1 className="text-[15px] font-medium">Agents</h1>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
        Custom agents on your Manus account. Each one keeps its own thread, so a message continues the same conversation.
      </p>

      {loading ? (
        <div className="mt-6 grid place-items-center py-16">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="mt-8 text-[12.5px] text-destructive">{error}</p>
      ) : agents.length === 0 ? (
        <div className="mt-5 rounded-xl border border-border bg-card px-4 py-6 text-center">
          <Bot size={18} className="mx-auto text-muted-foreground" />
          <p className="mt-2 text-[12.5px] font-medium">No custom agents yet</p>
          <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed text-muted-foreground">
            Create an agent in Manus and it appears here with its own thread you can message from this workspace.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}