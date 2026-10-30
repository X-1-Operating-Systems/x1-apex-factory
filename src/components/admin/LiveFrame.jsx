import React, { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Live view of the app's own browser host: a signed frame URL, refreshed on a short cycle.
 * The token never reaches this page — the backend signs one session-scoped URL.
 */
export default function LiveFrame({ sessionId, heightClass = 'h-[240px]' }) {
  const [frameUrl, setFrameUrl] = useState(null);
  const [src, setSrc] = useState(null);
  const [state, setState] = useState('offline');

  useEffect(() => {
    let alive = true;
    setFrameUrl(null);
    setSrc(null);
    if (!sessionId) {
      setState('offline');
      return undefined;
    }
    setState('loading');
    base44.functions
      .invoke('browserbase', { action: 'sessions.debug', params: { session_id: sessionId } })
      .then((res) => {
        if (!alive) return;
        const payload = res.data || {};
        const next = payload.data && payload.data.frameUrl;
        if (payload.ok && next) {
          setFrameUrl(next);
          setState('ready');
        } else {
          setState('offline');
        }
      })
      .catch(() => {
        if (alive) setState('offline');
      });
    return () => {
      alive = false;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!frameUrl) return undefined;
    let alive = true;
    const tick = () => {
      if (alive) setSrc(`${frameUrl}&t=${Date.now()}`);
    };
    tick();
    const timer = setInterval(tick, 1500);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [frameUrl]);

  return (
    <div className={`overflow-hidden rounded-lg border border-border bg-secondary ${heightClass}`}>
      {state === 'ready' && src ? (
        <img
          src={src}
          alt={`Live browser for session ${sessionId}`}
          className="h-full w-full bg-background object-contain"
          onError={() => setState('offline')}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 px-4 text-center">
          {state === 'loading' ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-foreground" />
              <p className="text-[11px] text-muted-foreground">Connecting live view</p>
            </>
          ) : (
            <>
              <Monitor size={16} className="text-muted-foreground" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {sessionId ? 'This session has closed.' : 'No live session yet.'}
              </p>
            </>
          )}
        </div>
      )}
      {sessionId && state === 'ready' && (
        <div className="flex items-center justify-between border-t border-border px-2 py-1">
          <span className="truncate font-mono text-[9.5px] text-muted-foreground">{sessionId}</span>
          <span className="text-[10px] text-muted-foreground">your host</span>
        </div>
      )}
    </div>
  );
}