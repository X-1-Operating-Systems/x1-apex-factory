import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvatarPicker from '@/components/video/AvatarPicker';
import VoicePicker from '@/components/video/VoicePicker';
import { callVideo, RATIOS } from '@/lib/videoApi';
import { EDEN_PERSONA } from '@/lib/edenPersona';

export default function RenderForm({ groups, voices, persona, onCreated }) {
  // Her approved clone is the default, so a render speaks in her voice unless it is changed.
  const [avatarId, setAvatarId] = useState(EDEN_PERSONA.avatar_id);
  const [voiceId, setVoiceId] = useState(EDEN_PERSONA.voice_id);
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [ratio, setRatio] = useState('16:9');
  const [resolution, setResolution] = useState('1080p');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const pickAvatar = (group) => {
    setAvatarId(group.id);
    if (!voiceId && group.default_voice_id) setVoiceId(group.default_voice_id);
  };

  const submit = async () => {
    if (!avatarId) {
      setError('Pick an avatar first.');
      return;
    }
    if (script.trim().length < 4) {
      setError('Write the script the avatar should speak.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await callVideo(
      'heygen',
      'videos.create',
      {
        avatar_id: avatarId,
        voice_id: voiceId || undefined,
        script: script.trim(),
        ratio,
        resolution,
        title: title.trim() || undefined,
      },
      true,
    );
    setBusy(false);
    if (!result.ok) {
      setError(result.error || 'HeyGen refused the render.');
      return;
    }
    setScript('');
    setTitle('');
    if (onCreated) onCreated();
  };

  return (
    <section className="rounded-lg border border-border bg-card px-3.5 py-3">
      <h2 className="font-heading text-[13px] tracking-tight">Render an avatar video</h2>

      <p className="mt-2.5 text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Avatar</p>
      <div className="mt-1">
        <AvatarPicker
          groups={groups}
          pinned={persona?.avatar ? [persona.avatar] : []}
          value={avatarId}
          onChange={pickAvatar}
        />
      </div>

      <p className="mt-2.5 text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground">Voice</p>
      <div className="mt-1">
        <VoicePicker
          voices={voices}
          pinned={persona?.voice ? [persona.voice] : []}
          value={voiceId}
          onChange={setVoiceId}
        />
      </div>
      <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
        {EDEN_PERSONA.voice_name} is selected by default — approved {EDEN_PERSONA.approved_on}.
      </p>

      <div className="mt-2.5 flex gap-1.5">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title (optional)"
          className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-[11.5px] outline-none focus:ring-1 focus:ring-ring"
        />
        <select
          value={ratio}
          onChange={(event) => setRatio(event.target.value)}
          className="h-8 rounded-md border border-input bg-background px-1.5 text-[11.5px] outline-none focus:ring-1 focus:ring-ring"
        >
          {RATIOS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={resolution}
          onChange={(event) => setResolution(event.target.value)}
          className="h-8 rounded-md border border-input bg-background px-1.5 text-[11.5px] outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="1080p">1080p</option>
          <option value="720p">720p</option>
        </select>
      </div>

      <textarea
        value={script}
        onChange={(event) => setScript(event.target.value)}
        rows={4}
        placeholder="What should the avatar say?"
        className="mt-1.5 w-full resize-y rounded-md border border-input bg-background px-2 py-1.5 text-[11.5px] leading-relaxed outline-none focus:ring-1 focus:ring-ring"
      />

      {error && <p className="mt-1.5 text-[10.5px] leading-relaxed text-destructive">{error}</p>}

      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" className="rounded-full" disabled={busy} onClick={submit}>
          {busy ? <Loader2 size={11} className="mr-1 animate-spin" /> : null}
          {busy ? 'Rendering' : 'Render'}
        </Button>
      </div>
    </section>
  );
}