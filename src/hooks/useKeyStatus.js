import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// One fetch per session: which keys exist and what each one powers. Presence only — the function
// never returns a value.
let cached = null;
let inflight = null;

export function loadKeyStatus() {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = base44.functions
      .invoke('keyStatus', {})
      .then((res) => {
        cached = res.data || { ok: false };
        return cached;
      })
      .catch(() => ({ ok: false, ready: {}, surfaces: [] }))
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export default function useKeyStatus() {
  const [status, setStatus] = useState(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let alive = true;
    loadKeyStatus().then((value) => {
      if (!alive) return;
      setStatus(value);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  return { status, loading, ready: status?.ready || {}, surfaces: status?.surfaces || [] };
}