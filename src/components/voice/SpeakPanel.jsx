import React, { useState } from 'react';
import { Loader2, Sparkles, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProsodyPanel from '@/components/voice/ProsodyPanel';
import AudioPlayer from '@/components/voice/AudioPlayer';
import { voiceCall, voiceData } from '@/lib/voiceApi';

const START = { speed: 1, pitch: 0, volume: 1, pause_scale: 1, emotion: 'neutral' };

export default function SpeakPanel({ voiceId, emotions = [], onRendered }) {
  const [script, setScript] = useState('');
  const [prosody, setProsody] = useState(START);
  const [format, setFormat] = useState('wav');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [render, setRender] = useState(null);

  const generate = async () => {
    const text = script.trim();
    if (!text) {
      setError('Write something to say first.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await voiceCall('speak', { text, voice_id: voiceId, format, ...prosody });
    const payload = voiceData(result);
    setBusy(false);
    if (!result?.ok || !payload?.job_id) {
      setError(result?.error || payload?.error || 'The engine did not answer.');
      return;
    }
    setRender(payload);
    onRendered?.();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <textarea
          value={script}
          onChange={(event) => setScript(event.target.value)}
          placeholder="Type the script. Add <break time=&quot;600ms&quot;/> where it should pause."
          className="min-h-[150px] w-full resize-y bg-transparent text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setScript((current) => `${current}<break time="500ms"/>`)}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Timer size={11} /> Insert pause
            </button>
            <span className="text-[11px] text-muted-foreground">{script.length} chars</span>
          </div>
          <div className="flex items-center gap-1">
            {['wav', 'mp3'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFormat(option)}
                className={`rounded-md px-2 py-1 text-[11px] uppercase transition-colors ${
                  format === option ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <ProsodyPanel
          value={prosody}
          onChange={setProsody}
          emotions={emotions}
          onChangeEmotion={(emotion) => setProsody((current) => ({ ...current, emotion }))}
        />
      </div>

      {error && <p className="text-[12px] text-destructive">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={generate} disabled={busy} className="gap-2">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {busy ? 'Rendering' : 'Generate speech'}
        </Button>
        {render && (
          <div className="flex flex-wrap items-center gap-3">
            <AudioPlayer path={render.url} label={render.job_id} />
            <span className="text-[11px] text-muted-foreground">
              {render.voice_name} · {render.prosody?.emotion} · {render.prosody?.speed}× ·{' '}
              {render.prosody?.pitch > 0 ? '+' : ''}
              {render.prosody?.pitch} st
            </span>
          </div>
        )}
      </div>
    </div>
  );
}