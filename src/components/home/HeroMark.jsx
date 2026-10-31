import React from 'react';

// The mark alone, drawn at hero scale: an X and a 1 cut into one monogram.
export default function HeroMark() {
  return (
    <div className="flex flex-col items-center">
      <span className="grid h-14 w-14 place-items-center rounded-[16px] bg-foreground text-background shadow-[0_1px_2px_hsl(0_0%_0%/0.2)]">
        <svg viewBox="0 0 28 28" className="h-[38px] w-[38px]" fill="none" aria-hidden="true">
          <rect
            x="0.75"
            y="0.75"
            width="26.5"
            height="26.5"
            rx="9"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeWidth="1"
          />
          <path d="M7.6 8.8 14 19.4M14 8.8 7.6 19.4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
          <path
            d="M18.4 11.4 20.9 9.8V19.5"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="mt-3 font-heading text-[19px] tracking-[-0.015em] text-foreground">X1 Apex Factory</p>
    </div>
  );
}