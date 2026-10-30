import React, { useEffect, useRef, useState } from 'react';
import { Copy, Loader2, Phone, Play, Square } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Image } from '@/components/ui/image';
import AvatarStage from '@/components/live/AvatarStage';
import { EDEN_SKYE_PORTRAIT } from '@/components/live/AvatarPortrait';

// One room that stays open: the backend rolls a fresh LiveAvatar session over before the vendor's
// per-session ceiling, so the same join details work from the computer now and the phone later.
export default function PersistentRoom({ hasOwnAvatar, onChanged }) {
  const [session, setSession] = useState(null);
  const [credits, setCredits] = useState(null);
  const [sandbox, setSandbox] = useState(true);
  const [armed, setArmed] = useState(false);
  const [keeping, setKeeping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tick, setTick] = useState(Date.now());
  const renewalsRef = useRef(0);

  const call = async (action, extra = {}) => {
    try {
      const res = await base44.functions.invoke('edenLive', { action, ...extra });
      return res.data || { ok: false, error: 'The live room returned nothing.' };
    } catch (err) {
      const detail = err?.response?.data;
      return detail && typeof detail === 'object' ? detail : { ok: false, error: err?.message };
    }
  };

  const apply = (res) => {
    if (!res.ok) {
      setError(res.error || 'The live room did not answer.');
      return;
    }
    setError(null);
    if (res.session) {
      setSession(res.session);
      renewalsRef.current = res.started ? renewalsRef.current + 1 : renewalsRef.current;
      if (res.started) onChanged?.();
    } else {
      setSession(null);
    }
    if (Number.isFinite(Number(res.credits))) setCredits(Number(res.credits));
  };

  // Pick up a room that is already open (started here or on another device).
  useEffect(() => {
    call('state').then((res) => {
      if (res.ok && res.session) {
        setSession(res.session);
        renewalsRef.current = (res.session.renewals || 0) + 1;
        // A room already open is held by this page, so it keeps rolling over instead of dying in 60s.
        setKeeping(true);
      }
      if (Number.isFinite(Number(res.credits))) setCredits(Number(res.credits));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While she is kept alive, ask the backend to hold the room open; it renews before expiry.
  useEffect(() => {
    if (!keeping) return undefined;
    let alive = true;
    const beat = async () => {
      const res = await call('keep', { sandbox, renewals: renewalsRef.current });
      if (alive) apply(res);
    };
    beat();
    const timer = window.setInterval(beat, 15000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keeping, sandbox]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const secondsLeft = session?.expires_at
    ? Math.max(0, Math.round((Date.parse(session.expires_at) - tick) / 1000))
    : 0;

  const goLive = async () => {
    setBusy(true);
    setError(null);
    const res = await call('keep', { sandbox, renewals: 0 });
    apply(res);
    if (res.ok) setKeeping(true);
    setBusy(false);
    setArmed(false);
  };

  const stop = async () => {
    setBusy(true);
    const res = await call('stop');
    setKeeping(false);
    setSession(null);
    if (Number.isFinite(Number(res.credits))) setCredits(Number(res.credits));
    if (!res.ok) setError(res.error || 'The room did not stop.');
    setBusy(false);
    onChanged?.();
  };

  const joinLink = typeof window !== 'undefined' ? `${window.location.origin}/live` : '';

  return (
    <section className="rounded-lg border border-border bg-card px-3.5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-[13px] tracking-tight">Her room, kept open</h2>
        <label className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
          <Switch checked={sandbox} onCheckedChange={setSandbox} disabled={!!session} />
          Sandbox (free, 60s cycles)
        </label>
      </div>

      <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
        {session
          ? `Live · ${secondsLeft}s left in this session${keeping ? ', renewed automatically' : ', not renewing'} · ${session.renewals} renewal${session.renewals === 1 ? '' : 's'}`
          : 'One room you can open from this computer or your phone. Sessions roll over on their own, so she stays there.'}
      </p>

      {!session && (
        <div className="mt-2 overflow-hidden rounded-md border border-border bg-black">
          <Image
            src={EDEN_SKYE_PORTRAIT}
            alt="Eden Skye"
            className="block aspect-video w-full opacity-80"
            fittingType="fill"
            focalPointY={0.3}
          />
        </div>
      )}

      {session && (
        <div className="mt-2">
          <AvatarStage
            key={session.session_id}
            url={session.livekit_url}
            token={session.client_token}
            mode={session.mode}
            poster={EDEN_SKYE_PORTRAIT}
            onLeave={() => onChanged?.()}
          />
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
            Joining from a second device takes the room over — her token carries one viewer, so the
            first device drops out rather than both hearing her at once.
          </p>
        </div>
      )}

      {(!hasOwnAvatar || !session) && (
        <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
          LiveAvatar owns no avatar on this account yet, so this room runs LiveAvatar&apos;s preview
          avatar with Eden&apos;s own context and greeting. Her face and her HeyGen clone voice reach
          LiveAvatar only after her image is uploaded and validated in LiveAvatar itself.
        </p>
      )}

      {error && <p className="mt-1.5 text-[10.5px] leading-relaxed text-destructive">{error}</p>}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {session ? (
          <>
            <Button size="sm" variant="outline" className="rounded-full" disabled={busy} onClick={stop}>
              {busy ? <Loader2 size={11} className="mr-1 animate-spin" /> : <Square size={10} className="mr-1" />}
              End room
            </Button>
            {!keeping && (
              <Button size="sm" className="rounded-full" onClick={() => setKeeping(true)}>
                <Play size={10} className="mr-1" /> Keep her live
              </Button>
            )}
            {keeping && <span className="text-[10.5px] text-muted-foreground">Holding the room…</span>}
          </>
        ) : armed ? (
          <>
            <Button size="sm" className="rounded-full" disabled={busy} onClick={goLive}>
              {busy ? <Loader2 size={11} className="mr-1 animate-spin" /> : null}
              {sandbox ? 'Start the room' : 'Go live (bills 2 credits a minute)'}
            </Button>
            <button
              type="button"
              onClick={() => setArmed(false)}
              className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </>
        ) : (
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setArmed(true)}>
            <Play size={10} className="mr-1" /> Open her room
          </Button>
        )}

        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(joinLink);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-[3px] text-[10.5px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Copy size={9} /> {copied ? 'Link copied' : 'Copy phone link'}
        </button>
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <Phone size={9} /> {joinLink.replace(/^https?:\/\//, '')}
        </span>
        {Number.isFinite(credits) && (
          <span className="ml-auto text-[10.5px] tabular-nums text-muted-foreground">
            {credits.toLocaleString('en-US')} credits left
          </span>
        )}
      </div>
    </section>
  );
}