import React, { useRef, useState } from 'react';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/voice/AudioPlayer';
import { voiceCall, voiceData, fileToBase64, formatBytes } from '@/lib/voiceApi';

export default function ClonePanel({ clones = [], onChanged }) {
  const input = useRef(null);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const upload = async () => {
    if (!file) {
      setError('Choose a WAV recording first.');
      return;
    }
    setBusy(true);
    setError(null);
    const audio_base64 = await fileToBase64(file);
    const result = await voiceCall('clone', { audio_base64, name: name || file.name.replace(/\.[^.]+$/, '') });
    setBusy(false);
    if (!result?.ok) {
      setError(result?.error || 'The reference could not be stored.');
      return;
    }
    setFile(null);
    setName('');
    if (input.current) input.current.value = '';
    onChanged?.();
  };

  const remove = async (voiceId) => {
    const result = await voiceCall('clone.delete', { voice_id: voiceId });
    if (!result?.ok) {
      setError(result?.error || 'The clone could not be removed.');
      return;
    }
    onChanged?.();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-[12.5px] font-medium">Add a voice from reference audio</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
          A clean WAV of 6–30 seconds works best. The file is stored on your own volume and never leaves it.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            ref={input}
            type="file"
            accept="audio/wav,.wav"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="text-[11.5px] file:mr-2 file:rounded-md file:border file:border-border file:bg-secondary file:px-2 file:py-1 file:text-[11px]"
          />
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Voice name"
            className="h-8 min-w-[140px] flex-1 rounded-md border border-input bg-background px-2 text-[12px] outline-none focus:ring-1 focus:ring-ring"
          />
          <Button size="sm" onClick={upload} disabled={busy} className="gap-1.5">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {busy ? 'Storing' : 'Add voice'}
          </Button>
        </div>
        {error && <p className="mt-2 text-[12px] text-destructive">{error}</p>}
      </div>

      <div className="space-y-2">
        {clones.length === 0 && (
          <p className="text-[12px] text-muted-foreground">No cloned voices yet.</p>
        )}
        {clones.map((clone) => (
          <div key={clone.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium">{clone.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatBytes(clone.bytes)} · {clone.reference_seconds || 0}s reference · {clone.defaults?.emotion || 'neutral'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AudioPlayer path={`/clone/${clone.id}/reference`} label={clone.name} />
              <button
                type="button"
                onClick={() => remove(clone.id)}
                aria-label={`Remove ${clone.name}`}
                className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}