import React, { useEffect, useState } from 'react';
import { Monitor, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LiveFrame({ sessionId, heightClass = 'h-[240px]' }) {
  const [url, setUrl] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let alive = true;
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
        const next = payload.data && (payload.data.debuggerFullscreenUrl || payload.data.debuggerUrl);
        if (payload.ok && next) {
          setUrl(next);
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

  return (
    <div className={`overflow-hidden rounded-lg border border-border bg-secondary ${heightClass}`}>
      {state === 'ready' && url ? (
        <iframe src={url} title={`Live browser ${sessionId}`} className="h-full w-full" allow="clipboard-read; clipboard-write" />
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
                {sessionId ? 'This session is closed. Open the replay for the recording.' : 'No live session yet.'}
              </p>
            </>
          )}
        </div>
      )}
      {url && (
        <div className="flex items-center justify-between border-t border-border px-2 py-1">
          <span className="truncate font-mono text-[9.5px] text-muted-foreground">{sessionId}</span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Open <ExternalLink size={9} />
          </a>
        </div>
      )}
    </div>
  );
}