import React, { useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ControlComposer({ onSend, onReset, busy }) {
  const [value, setValue] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const text = value.trim();
    if (!text || busy) return;
    setValue('');
    onSend(text);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit(event);
    }
  };

  return (
    <form onSubmit={submit} className="composer-shell mx-auto w-full max-w-[720px] rounded-xl p-2">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        rows={2}
        placeholder="Tell the control plane what to do"
        aria-label="Control plane message"
        className="w-full resize-none bg-transparent px-2 py-1.5 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground"
      />
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-[10px] text-muted-foreground">
          One named action per message. Destructive actions ask first.
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          {onReset && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-7 px-2 text-[11px]"
            >
              New
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={busy || !value.trim()}
            className="h-8 gap-1.5 px-3 text-[11.5px]"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <ArrowUp size={12} />}
            Run
          </Button>
        </div>
      </div>
    </form>
  );
}