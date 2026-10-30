import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import useBrowserChat from '@/hooks/useBrowserChat';
import ControlThread from '@/components/admin/ControlThread';
import ControlComposer from '@/components/admin/ControlComposer';
import GuardrailBar from '@/components/admin/GuardrailBar';
import LiveFrame from '@/components/admin/LiveFrame';

export default function AdminControl() {
  const { user } = useAuth();
  const chat = useBrowserChat();
  const [guardrail, setGuardrail] = useState(null);
  const [minutes, setMinutes] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    base44.entities.BrowserGuardrail
      .list({ limit: 1 })
      .then((page) => setGuardrail(page.items[0] || null))
      .catch(() => {});
    base44.functions
      .invoke('browserbase', { action: 'usage.get' })
      .then((res) => {
        const payload = res.data || {};
        if (payload.ok && payload.data) setMinutes(Number(payload.data.browserMinutes) || 0);
      })
      .catch(() => {});
  }, [user]);

  const liveSession = useMemo(() => {
    for (let index = chat.messages.length - 1; index >= 0; index -= 1) {
      const message = chat.messages[index];
      if (message.action === 'sessions.create' && message.result && message.result.ok) {
        return (message.result.data && message.result.data.id) || null;
      }
    }
    return null;
  }, [chat.messages]);

  if (user && user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-[520px] px-6 py-16 text-center">
        <h1 className="display-title text-[22px]">Admins only</h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
          The control plane drives the workspace Browserbase account. Ask a workspace admin for access.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-border px-4 py-2.5 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-muted-foreground" />
            <h1 className="font-heading text-[15px] tracking-tight">Control plane</h1>
          </div>
          <GuardrailBar minutes={minutes} guardrail={guardrail} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto scroll-thin px-4 py-4 lg:px-6">
            <ControlThread
              messages={chat.messages}
              busy={chat.busy}
              onConfirm={chat.confirm}
              onCancel={chat.cancel}
            />
          </div>
          <div className="shrink-0 border-t border-border px-3 py-2.5 lg:px-6">
            {chat.error && <p className="mx-auto mb-1.5 max-w-[720px] text-[11px] text-destructive">{chat.error}</p>}
            <ControlComposer
              onSend={chat.send}
              onReset={chat.messages.length ? chat.reset : null}
              busy={chat.busy}
            />
          </div>
        </div>

        <aside className="hidden w-[360px] shrink-0 flex-col gap-2 border-l border-border p-3 xl:flex">
          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Computer</p>
          <LiveFrame sessionId={liveSession} heightClass="h-[300px]" />
          <p className="text-[10.5px] leading-relaxed text-muted-foreground">
            {liveSession
              ? 'This is the running browser. Every click a run makes happens here.'
              : 'Open a session from the thread and its live browser appears here.'}
          </p>
        </aside>
      </div>
    </div>
  );
}