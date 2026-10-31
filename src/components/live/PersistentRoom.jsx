import React, { useEffect, useRef, useState } from 'react';
import { Copy, Loader2, Phone, Play, Square } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Image } from '@/components/ui/image';
import AvatarStage from '@/components/live/AvatarStage';
import { EDEN_SKYE_PORTRAIT } from '@/components/live/AvatarPortrait';

// Full ceiling: her room opens, holds and rolls over with no hold and no extra confirmation step.
export default function PersistentRoom({ hasOwnAvatar, onChanged }) {
  const [session, setSession] = useState(null);
  const [credits, setCredits] = useState(null);
  const [sandbox, setSandbox] = useState(false);
  const [keeper, setKeeper] = useState({ enabled: false, sandbox: false });
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
    if (res.keeper) setKeeper(res.keeper);
  };

  // Pick up a room that is already open (started here or on another device).
  useEffect(() => {
    call('state').then((res) => {
      if (res.ok && res.session) {
        setSession(res.session);
        renewalsRef.current = (res.session.renewals || 0) + 1;
        // Do not automatically resume or renew previously opened rooms.
        setKeeping(false);
      }
      if (Number.isFinite(Number(res.credits))) setCredits(Number(res.credits));
      if (res.keeper) setKeeper(res.keeper);
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

  // The keeper runs on the server, so she stays live with this tab closed.
  const toggleKeeper = async (next) => {
    setBusy(true);
    setError(null);
    const res = await call('auto', { enabled: next, sandbox });
    apply(res);
    if (!res.ok) setError(res.error || 'The keeper did not answer.');
    if (!next) setKeeping(false);
    setBusy(false);
  };

  const joinLink = typeof window !== 'undefined' ? `${window.location.origin}/live` : '';

  return (
    <section className="rounded-lg border border-border bg-card px-3.5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-[13px] tracking-tight">Eden LiveAvatar</h2>
        <label className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
          <Switch checked={sandbox} onCheckedChange={setSandbox} />
          Sandbox (free, 60s cycles)
        </label>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md border border-border px-2.5 py-1.5">
        <label className="flex items-center gap-1.5 text-[10.5px] font-medium">
          <Switch checked={keeper.enabled} disabled={busy} onCheckedChange={toggleKeeper} />
          Hold her live 24/7
        </label>
        <span className="text-[10px] leading-relaxed text-muted-foreground">
          {keeper.enabled
            ? keeper.sandbox
              ? 'Server holds her every 5 minutes, free sandbox cycles'
              : 'Server holds her every 5 minutes, billing 2 credits/minute day and night'
            : 'Off — she only stays live while this tab is open'}
        </span>
      </div>

      <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">
        {session
          ? `Live · ${secondsLeft}s left in this session${keeping ? ', renewed automatically' : ', not renewing'} · ${session.renewals} renewal${session.renewals === 1 ? '' : 's'}`
          : 'Her room is closed. Opening it starts a live session that renews itself before the vendor ceiling.'}
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
            If the view stays blank or the microphone doesn&apos;t work,{' '}
            <a
              href={joinLink}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-foreground"
            >
              open Eden Live in a separate tab
            </a>
            .
          </p>
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
        ) : (
          <Button size="sm" variant="outline" className="rounded-full" disabled={busy} onClick={goLive}>
            {busy ? <Loader2 size={11} className="mr-1 animate-spin" /> : <Play size={10} className="mr-1" />}
            {sandbox ? 'Open her room (free sandbox)' : 'Open her room (bills 2 credits/minute)'}
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