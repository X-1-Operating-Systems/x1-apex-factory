import React, { useEffect, useState } from 'react';
import { Loader2, Pause, Play, Download } from 'lucide-react';
import { loadAudio, formatBytes } from '@/lib/voiceApi';

export default function AudioPlayer({ path, label = 'Render' }) {
  const [state, setState] = useState({ loading: true, url: null, error: null, bytes: 0 });
  const [playing, setPlaying] = useState(false);
  const [element, setElement] = useState(null);

  useEffect(() => {
    let active = true;
    setState({ loading: true, url: null, error: null, bytes: 0 });
    loadAudio(path).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setState({ loading: false, url: null, error: result.error, bytes: 0 });
        return;
      }
      setState({ loading: false, url: result.url, error: null, bytes: result.bytes });
    });
    return () => {
      active = false;
    };
  }, [path]);

  useEffect(() => {
    if (!state.url) return undefined;
    const audio = new Audio(state.url);
    audio.onended = () => setPlaying(false);
    setElement(audio);
    return () => {
      audio.pause();
      URL.revokeObjectURL(state.url);
    };
  }, [state.url]);

  const toggle = () => {
    if (!element) return;
    if (playing) {
      element.pause();
      setPlaying(false);
      return;
    }
    element.currentTime = 0;
    element.play().catch(() => {});
    setPlaying(true);
  };

  if (state.loading) {
    return (
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <Loader2 size={13} className="animate-spin" /> Loading {label.toLowerCase()}…
      </div>
    );
  }

  if (state.error) {
    return <p className="text-[12px] text-destructive">{state.error}</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause size={13} /> : <Play size={13} />}
      </button>
      <a
        href={state.url}
        download={`${label.toLowerCase().replace(/\s+/g, '-')}.${path.split('.').pop()}`}
        className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <Download size={11} /> {formatBytes(state.bytes)}
      </a>
    </div>
  );
}