import React, { useEffect, useState } from 'react';
import { Cable } from 'lucide-react';
import { loadBridgeEvents, loadBridgeState } from '@/lib/bridgeApi';
import BridgeStatusCard from '@/components/bridge/BridgeStatusCard';
import BridgeContract from '@/components/bridge/BridgeContract';
import BridgeLog from '@/components/bridge/BridgeLog';

export default function Bridge() {
  const [state, setState] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  const loadEvents = () =>
    loadBridgeEvents()
      .then(setEvents)
      .catch(() => setEvents([]));

  useEffect(() => {
    loadBridgeState()
      .then(setState)
      .catch((err) => setError(err?.response?.data?.error || err.message));
    loadEvents();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 pb-14 pt-6 sm:px-8">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-card">
          <Cable size={16} strokeWidth={1.8} className="text-muted-foreground" />
        </span>
        <div>
          <h1 className="font-heading text-[22px] leading-tight">X1 bridge</h1>
          <p className="mt-1 max-w-[580px] text-[12px] leading-relaxed text-muted-foreground">
            One key connects the X1 Operating System to this factory. The OS sends it with every call,
            the factory answers only the actions listed below, and every call is recorded.
          </p>
        </div>
      </header>

      {error && (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[11.5px] text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5 space-y-3">
        <BridgeStatusCard state={state} onRoundTrip={loadEvents} />
        <BridgeContract state={state} />
        <BridgeLog events={events} />
      </div>
    </div>
  );
}