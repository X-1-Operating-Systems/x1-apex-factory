import React, { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { callVideo, payloadOf } from '@/lib/videoApi';
import PersistentRoom from '@/components/live/PersistentRoom';
import SessionHistory from '@/components/live/SessionHistory';
import CapabilityTable from '@/components/video/CapabilityTable';
import AdminGate from '@/components/video/AdminGate';
import KeyNotice from '@/components/system/KeyNotice';

export default function LiveAvatar() {
  const { user } = useAuth();
  const [credits, setCredits] = useState(null);
  const [contexts, setContexts] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [voices, setVoices] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSessions = async () => {
    const page = await base44.entities.LiveSession.list({ sort: '-created_date', limit: 20 });
    setSessions(page.items || []);
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    (async () => {
      const [creditRes, contextRes, avatarRes, voiceRes, capRes] = await Promise.all([
        callVideo('liveavatar', 'credits.get'),
        callVideo('liveavatar', 'contexts.list', { page_size: 20 }),
        callVideo('liveavatar', 'avatars.list', { page_size: 20 }),
        callVideo('liveavatar', 'voices.list', { page_size: 20 }),
        callVideo('liveavatar', 'registry.list'),
      ]);
      if (creditRes.ok) setCredits(payloadOf(creditRes));
      else setError(creditRes.error || 'LiveAvatar did not answer.');
      setContexts(payloadOf(contextRes)?.results || []);
      setAvatars(payloadOf(avatarRes)?.results || []);
      setVoices(payloadOf(voiceRes)?.results || []);
      setCapabilities(payloadOf(capRes) || []);
      await loadSessions().catch(() => {});
    })().finally(() => setLoading(false));
  }, [user]);

  if (user && user.role !== 'admin') return <AdminGate />;

  const left = Number(credits?.credits_left);

  return (
    <div className="mx-auto max-w-[880px] px-4 py-5 lg:px-6">
      <header className="flex flex-wrap items-center gap-2">
        <Radio size={15} className="text-muted-foreground" />
        <h1 className="font-heading text-[17px] tracking-tight">Live avatar</h1>
        <span className="text-[11px] text-muted-foreground">LiveAvatar v1</span>
        <span className="ml-auto font-heading text-[13px] tabular-nums">
          {loading && !credits ? '…' : Number.isFinite(left) ? left.toLocaleString('en-US') : '—'}
          <span className="ml-1 text-[10px] uppercase tracking-[0.06em] text-muted-foreground">credits</span>
        </span>
      </header>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
        Interactive avatar sessions on your own contexts. Sandbox sessions are free; a live session bills
        per minute against the balance above.
      </p>

      <KeyNotice surfaceKey="Live avatar" />

      {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
        <PersistentRoom hasOwnAvatar={avatars.length > 0} onChanged={loadSessions} />
        <SessionHistory sessions={sessions} />
      </div>

      <CapabilityTable entries={capabilities} />
    </div>
  );
}