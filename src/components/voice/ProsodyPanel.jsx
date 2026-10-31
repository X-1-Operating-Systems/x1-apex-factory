import React from 'react';
import { Slider } from '@/components/ui/slider';

function Field({ label, value, hint, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11.5px] font-medium text-foreground">{label}</span>
        <span className="font-mono text-[10.5px] text-muted-foreground">{hint ?? value}</span>
      </div>
      {children}
    </div>
  );
}

export default function ProsodyPanel({ value, onChange, emotions = [], onChangeEmotion }) {
  const set = (key) => (next) => onChange({ ...value, [key]: next[0] });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Speed" value={value.speed} hint={`${value.speed.toFixed(2)}×`}>
        <Slider value={[value.speed]} min={0.5} max={2} step={0.01} onValueChange={set('speed')} />
      </Field>
      <Field label="Pitch" value={value.pitch} hint={`${value.pitch > 0 ? '+' : ''}${value.pitch.toFixed(1)} st`}>
        <Slider value={[value.pitch]} min={-12} max={12} step={0.1} onValueChange={set('pitch')} />
      </Field>
      <Field label="Volume" value={value.volume} hint={`${value.volume.toFixed(2)}×`}>
        <Slider value={[value.volume]} min={0.2} max={2} step={0.01} onValueChange={set('volume')} />
      </Field>
      <Field label="Pause length" value={value.pause_scale} hint={`${value.pause_scale.toFixed(2)}×`}>
        <Slider value={[value.pause_scale]} min={0.25} max={3} step={0.05} onValueChange={set('pause_scale')} />
      </Field>

      <div className="sm:col-span-2">
        <p className="mb-1.5 text-[11.5px] font-medium">Emotion</p>
        <div className="flex flex-wrap gap-1.5">
          {emotions.map((emotion) => (
            <button
              key={emotion}
              type="button"
              onClick={() => onChangeEmotion(emotion)}
              className={`rounded-full border px-2.5 py-1 text-[11px] capitalize transition-colors ${
                value.emotion === emotion
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {emotion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}