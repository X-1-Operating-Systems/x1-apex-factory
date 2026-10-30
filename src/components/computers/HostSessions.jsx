import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import HostSessionRow from './HostSessionRow';

/**
 * The browsers this app actually runs. Sessions open here from the control plane
 * or from a browser run, so the board is the host's own record — nothing borrowed.
 */
export default function HostSessions({ reloadKey }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    base44.entities.BrowserSession
      .filter({}, { sort: '-created_date', limit: 12 })
      .then((page) => {
        if (alive) setSessions(page.items || []);
      })
      .catch(() => {
        if (alive) setSessions([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  if (loading) {
    return <p className="mt-3 text-[11.5px] text-muted-foreground">Reading your host…</p>;
  }

  if (sessions.length === 0) {
    return (
      <div className="mt-3 rounded-xl border border-border bg-card px-4 py-6 text-center">
        <p className="text-[12.5px] font-medium">No browser sessions yet</p>
        <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed text-muted-foreground">
          Open one from the control plane, or start a browser run, and it lands here with its live view.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
      {sessions.map((session) => (
        <HostSessionRow
          key={session.id}
          session={session}
          canViewLive={user?.role === 'admin'}
        />
      ))}
    </div>
  );
}