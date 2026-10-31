import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function BridgeContract({ state }) {
  const [copied, setCopied] = useState(false);
  const endpoint = state?.endpoint || 'https://x1-apex-factory.base44.app/functions/x1Bridge';
  const header = state?.header || 'x-x1-bridge-key';
  const actions = state?.actions || [];

  const curl = `curl -X POST '${endpoint}' \\
  -H 'Content-Type: application/json' \\
  -H '${header}: <X1_BRIDGE_KEY>' \\
  -d '{"action":"ping"}'`;

  const copy = async () => {
    await navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="glass-panel rounded-xl p-4">
      <p className="text-[12.5px] font-medium">The contract</p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
        POST JSON to the endpoint with the key in the header — or as <code className="font-mono">bridge_key</code> in
        the body if the OS cannot set headers. Anything else is refused before a single record is read.
      </p>

      <div className="relative mt-3">
        <pre className="scroll-thin overflow-x-auto rounded-lg border border-border bg-secondary/50 p-3 font-mono text-[10.5px] leading-relaxed">
          {curl}
        </pre>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy the request"
          className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
        </button>
      </div>

      <div className="mt-3 divide-y divide-border overflow-hidden rounded-lg border border-border">
        {actions.length === 0 ? (
          <p className="px-3 py-3 text-[11px] text-muted-foreground">Reading the action list…</p>
        ) : (
          actions.map((item) => (
            <div key={item.name} className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:items-baseline sm:gap-3">
              <code className="w-[104px] shrink-0 font-mono text-[11px] font-medium">{item.name}</code>
              <span className="text-[11px] leading-relaxed text-muted-foreground">{item.description}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}