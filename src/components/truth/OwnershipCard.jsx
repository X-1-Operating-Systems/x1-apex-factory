import React from 'react';

const OWNED = [
  'Every screen, entity and backend function in this app — no vendor SDK in the product path.',
  'browser-host/ — your Playwright + Chromium container, with its Dockerfile and server.',
  'avatar-host/ — your Wav2Lip + local TTS container, with its Dockerfile and server.',
  'docker-compose.yml and LOCAL.md — the recipe to run both engines on hardware you control.',
];

const GATES = [
  'HeyGen — renders bill their wallet. Nothing here can fund it.',
  'LiveAvatar — her avatar can only be created in their console; they expose no route.',
  'Railway / Vercel / Supabase — your accounts. The host and the ledger live there.',
  'Base44 — where this app and its database run, and where its LLM credits are spent.',
];

export default function OwnershipCard() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <p className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground">What you actually own</p>
        <ul className="mt-2 space-y-1.5">
          {OWNED.map((line) => (
            <li key={line} className="text-[12.5px] leading-relaxed text-muted-foreground">
              <span className="mr-1.5 text-foreground">·</span>
              {line}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.09em] text-muted-foreground">What still gates it</p>
        <ul className="mt-2 space-y-1.5">
          {GATES.map((line) => (
            <li key={line} className="text-[12.5px] leading-relaxed text-muted-foreground">
              <span className="mr-1.5 text-foreground">·</span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}