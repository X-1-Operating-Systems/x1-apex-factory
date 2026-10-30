import React from 'react';
import { Lock } from 'lucide-react';

export default function AdminGate() {
  return (
    <div className="mx-auto max-w-[520px] px-6 py-16 text-center">
      <Lock size={16} className="mx-auto text-muted-foreground" />
      <h1 className="mt-3 display-title text-[22px]">Admins only</h1>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
        These surfaces drive the workspace&apos;s own video accounts. Ask a workspace admin for access.
      </p>
    </div>
  );
}