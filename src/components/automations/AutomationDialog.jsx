import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TIMEZONES, detectTimezone } from '@/lib/automationSchedule';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AutomationDialog({ open, onOpenChange, onCreated }) {
  const [title, setTitle] = useState('');
  const [instruction, setInstruction] = useState('');
  const [triggerMode, setTriggerMode] = useState('schedule');
  const [eventWhen, setEventWhen] = useState('any');
  const [cadence, setCadence] = useState('daily');
  const [hour, setHour] = useState('09:00');
  const [day, setDay] = useState('1');
  const [timezone, setTimezone] = useState(() => detectTimezone());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setInstruction('');
    setTriggerMode('schedule');
    setEventWhen('any');
    setCadence('daily');
    setHour('09:00');
    setDay('1');
    setTimezone(detectTimezone());
    setError('');
  }, [open]);

  const submit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !instruction.trim()) {
      setError('Give the automation a name and an instruction.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const created = await base44.entities.Automation.create({
        title: title.trim(),
        instruction: instruction.trim(),
        trigger_mode: triggerMode,
        event_when: triggerMode === 'event' ? eventWhen : 'any',
        cadence,
        run_hour: Number(hour.slice(0, 2)),
        run_day: Number(day),
        timezone,
        enabled: true,
      });
      onCreated(created);
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'Could not save the automation.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-medium">New automation</DialogTitle>
          <DialogDescription>
            An agent runs this instruction on a schedule, or right after one of your tasks finishes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="automation-title" className="text-[11.5px] text-muted-foreground">Name</Label>
            <Input
              id="automation-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Weekly competitor scan"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="automation-instruction" className="text-[11.5px] text-muted-foreground">Instruction</Label>
            <Textarea
              id="automation-instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={4}
              placeholder="Scan competitor pricing pages and summarise any changes into a short brief."
              className="resize-none text-[13px]"
            />
          </div>

          <div className="inline-flex rounded-full border border-border p-0.5">
            {[
              { value: 'schedule', label: 'On a schedule' },
              { value: 'event', label: 'After a task' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTriggerMode(option.value)}
                className={`rounded-full px-3 py-1 text-[11.5px] transition-colors ${
                  triggerMode === option.value
                    ? 'bg-foreground font-medium text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {triggerMode === 'event' ? (
            <div className="space-y-1.5">
              <Label htmlFor="automation-event" className="text-[11.5px] text-muted-foreground">Runs</Label>
              <select
                id="automation-event"
                value={eventWhen}
                onChange={(e) => setEventWhen(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:border-foreground"
              >
                <option value="any">After any of my tasks finishes</option>
                <option value="done">After a task succeeds</option>
                <option value="failed">After a task fails</option>
              </select>
              <p className="text-[10.5px] leading-relaxed text-muted-foreground">
                Fires on your own tasks, once per task, and never on a run this automation started.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="automation-cadence" className="text-[11.5px] text-muted-foreground">Repeats</Label>
                  <select
                    id="automation-cadence"
                    value={cadence}
                    onChange={(e) => setCadence(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm capitalize outline-none focus:border-foreground"
                  >
                    <option value="hourly">Every hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                {cadence !== 'hourly' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="automation-hour" className="text-[11.5px] text-muted-foreground">Around</Label>
                    <Input id="automation-hour" type="time" value={hour} onChange={(e) => setHour(e.target.value)} />
                  </div>
                )}
              </div>

              {cadence === 'weekly' && (
                <div className="space-y-1.5">
                  <Label htmlFor="automation-day" className="text-[11.5px] text-muted-foreground">Day</Label>
                  <select
                    id="automation-day"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:border-foreground"
                  >
                    {WEEKDAYS.map((label, index) => (
                      <option key={label} value={index}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="automation-timezone" className="text-[11.5px] text-muted-foreground">Time zone</Label>
                <select
                  id="automation-timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:border-foreground"
                >
                  {TIMEZONES.map((zone) => (
                    <option key={zone} value={zone}>{zone.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && <p className="text-[12px] text-destructive">{error}</p>}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Saving…' : 'Create automation'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}