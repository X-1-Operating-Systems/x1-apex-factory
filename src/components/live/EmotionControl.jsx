import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// One row of the settings menu, drawn from the control description rather than hand-written,
// so adding a setting never means writing markup.
export default function EmotionControl({ control, value, onChange }) {
  const id = `emotion-${control.key}`;
  const showValue = control.type === 'range';
  const display = control.format === 'percent'
    ? `${Math.round((Number(value) || 0) * 100)}%`
    : String(value ?? '');

  return (
    <div className="space-y-1">
      {control.type === 'toggle' ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Label htmlFor={id} className="text-[12px] font-medium">{control.label}</Label>
            {control.hint && <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">{control.hint}</p>}
          </div>
          <Switch id={id} checked={Boolean(value)} onCheckedChange={onChange} />
        </div>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor={id} className="text-[12px] font-medium">{control.label}</Label>
            {showValue && <span className="text-[11px] tabular-nums text-muted-foreground">{display}</span>}
          </div>

          {control.type === 'range' && (
            <Slider
              id={id}
              min={control.min}
              max={control.max}
              step={control.step}
              value={[Number(value) || 0]}
              onValueChange={([next]) => onChange(next)}
              className="py-1"
            />
          )}

          {control.type === 'select' && (
            <Select value={String(value ?? '')} onValueChange={onChange}>
              <SelectTrigger id={id} className="h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {control.options.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-[12px]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {control.type === 'text' && (
            <Input id={id} value={String(value ?? '')} onChange={(event) => onChange(event.target.value)} className="h-8 text-[12px]" />
          )}

          {control.type === 'textarea' && (
            <Textarea
              id={id}
              value={String(value ?? '')}
              onChange={(event) => onChange(event.target.value)}
              rows={3}
              className="text-[12px] leading-relaxed"
            />
          )}

          {control.hint && <p className="text-[10.5px] leading-relaxed text-muted-foreground">{control.hint}</p>}
        </>
      )}
    </div>
  );
}