import React, { useState } from 'react';
import ComputerPane from '@/components/task/ComputerPane';

const MIN = 300;
const MAX = 620;

export default function ComputerPanel({ task, events, run, engine, open, onClose }) {
  const [width, setWidth] = useState(360);

  const startDrag = (event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = width;
    const move = (moveEvent) => {
      const next = startWidth - (moveEvent.clientX - startX);
      const ceiling = Math.min(MAX, window.innerWidth * 0.92);
      setWidth(Math.min(Math.max(MIN, next), ceiling));
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-30 bg-foreground/10" onClick={onClose} aria-hidden="true" />
      <aside
        style={{ width }}
        className="fixed inset-y-0 right-0 z-40 flex max-w-[92vw] flex-col border-l border-border bg-background shadow-[-18px_0_40px_-32px_rgba(0,0,0,0.4)]"
      >
        <div
          onPointerDown={startDrag}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize computer panel"
          className="absolute inset-y-0 left-0 w-1.5 cursor-col-resize bg-transparent transition-colors hover:bg-border"
        />
        <ComputerPane task={task} events={events} run={run} engine={engine} onClose={onClose} />
      </aside>
    </>
  );
}