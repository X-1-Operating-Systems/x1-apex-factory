import React, { useState } from 'react';
import { Copy, Loader2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { callVideo, payloadOf, SANDBOX_AVATAR_ID } from '@/lib/videoApi';

export default function SessionStarter({ contexts = [], avatars = [], voices = [], onChanged }) {
  const [avatarId, setAvatarId] = useState(SANDBOX_AVATAR_ID);
  const [mode, setMode] = useState('FULL');
  const [sandbox, setSandbox] = useState(true);
  const [contextId, setContextId] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [duration, setDuration] = useState(60);
  const [token, setToken] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');

  const copy = (label, value) => {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(''), 1500);
  };

  const start = async () => {
    setBusy(true);
    setError(null);
    const tokenRes = await callVideo('liveavatar', 'sessions.token', {
      avatar_id: avatarId,
      mode,
      is_sandbox: sandbox,
      context_id: contextId || undefined,
      voice_id: voiceId || undefined,
      max_session_duration: duration,
    });
    const sessionToken = payloadOf(tokenRes)?.session_token;
    if (!tokenRes.ok || !sessionToken) {
      setBusy(false);
      setError(tokenRes.error || 'LiveAvatar refused the session token.');
      return;
    }
    const startRes = await callVideo(
      'liveavatar',
      'sessions.start',
      {
        session_token: sessionToken,
        avatar_id: avatarId,
        mode,
        is_sandbox: sandbox,
        context_id: contextId || undefined,
      },
      true,
    );
    setBusy(false);
    if (!startRes.ok) {
      setError(startRes.error || 'The session did not start.');
      return;
    }
    setToken(sessionToken);
    setSession(payloadOf(startRes));
    if (onChanged) onChanged();
  };

  const stop = async () => {
    if (!token) return;
    setBusy(true);
    setError(null);
    const result = await callVideo('liveavatar', 'sessions.stop', {
      session_token: token,
      session_id: session?.session_id,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error || 'The session did not stop.');
      return;
    }
    setToken(null);
    setSession(null);
    if (onChanged) onChanged();
  };

  return (
    <section className="rounded-lg border border-border bg-card px-3.5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-[13px] tracking-tight">Open a session</h2>
        <label className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
          <Switch checked={sandbox} onCheckedChange={setSandbox} />
          Sandbox (free, ends in ~60s)
        </label>
      </div>

      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        <select
          value={avatarId}
          onChange={(event) => setAvatarId(event.target.value)}
          className="h-8 w-full rounded-md border border-input bg-background px-2 text-[11.5px] outline-none focus:ring-1 focus:ring-ring"
        >
          <option value={SANDBOX_AVATAR_ID}>Sandbox avatar</option>
          {avatars.map((avatar) => (
            <option key={avatar.id} value={avatar.id}>
              {avatar.name || avatar.id}
            </option>
          ))}
        </select>

        <select
          value={contextId}
          onChange={(event) => setContextId(event.target.value)}
          className="h-8 w-full rounded-md border border-input bg-background px-2 text-[11.5px] outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">No context</option>
          {contexts.map((context) => (
            <option key={context.id} value={context.id}>
              {context.name}
            </option>
          ))}
        </select>

        <select
          value={voiceId}
          onChange={(event) => setVoiceId(event.target.value)}
          className="h-8 w-full rounded-md border border-input bg-background px-2 text-[11.5px] outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Avatar&apos;s own voice</option>
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name} · {voice.language}
            </option>
          ))}
        </select>

        <div className="flex gap-1.5">
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            className="h-8 rounded-md border border-input bg-background px-1.5 text-[11.5px] outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="FULL">FULL</option>
            <option value="LITE">LITE</option>
          </select>
          <input
            type="number"
            min={30}
            max={3600}
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value) || 60)}
            aria-label="Maximum session seconds"
            className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-[11.5px] tabular-nums outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="self-center text-[10px] text-muted-foreground">sec</span>
        </div>
      </div>

      {error && <p className="mt-1.5 text-[10.5px] leading-relaxed text-destructive">{error}</p>}

      <div className="mt-2 flex items-center gap-2">
        {session ? (
          <Button size="sm" variant="outline" className="rounded-full" disabled={busy} onClick={stop}>
            {busy ? <Loader2 size={11} className="mr-1 animate-spin" /> : <Square size={10} className="mr-1" />}
            End session
          </Button>
        ) : (
          <Button size="sm" className="rounded-full" disabled={busy} onClick={start}>
            {busy ? <Loader2 size={11} className="mr-1 animate-spin" /> : null}
            {sandbox ? 'Start sandbox session' : 'Start session (bills per minute)'}
          </Button>
        )}
        {session && <span className="text-[10.5px] text-muted-foreground">Running</span>}
      </div>

      {session && (
        <div className="mt-2 space-y-1 rounded-md bg-secondary/60 px-2 py-1.5">
          <p className="truncate font-mono text-[10px]">session {session.session_id}</p>
          <p className="truncate font-mono text-[10px] text-muted-foreground">room {session.livekit_url}</p>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => copy('room', session.livekit_url)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-[2px] text-[10px] text-muted-foreground hover:text-foreground"
            >
              <Copy size={8} /> {copied === 'room' ? 'Copied' : 'Copy room'}
            </button>
            <button
              type="button"
              onClick={() => copy('token', session.livekit_client_token)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-[2px] text-[10px] text-muted-foreground hover:text-foreground"
            >
              <Copy size={8} /> {copied === 'token' ? 'Copied' : 'Copy client token'}
            </button>
          </div>
          <p className="pt-0.5 text-[10px] leading-relaxed text-muted-foreground">
            The avatar streams over that LiveKit room. In-page playback needs the LiveKit client, which is
            not installed here yet — the room and its client token are what it takes.
          </p>
        </div>
      )}
    </section>
  );
}