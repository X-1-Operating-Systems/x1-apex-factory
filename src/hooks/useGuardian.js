import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const call = async (payload) => {
  const res = await base44.functions.invoke('guardian', payload);
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
};

export default function useGuardian(enabled) {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const data = await call({ action: 'state' });
    setState(data);
    return data;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load().catch((err) => setError(err.message));
  }, [enabled, load]);

  const run = async (key, payload) => {
    setBusy(key);
    setError(null);
    try {
      const result = await call(payload);
      await load();
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBusy(null);
    }
  };

  return {
    state,
    busy,
    error,
    reload: load,
    verify: () => run('verify', { action: 'verify' }),
    audit: () => run('audit', { action: 'audit' }),
    heal: (repair) => run(`heal:${repair}`, { action: 'heal', repair }),
    evolve: () => run('evolve', { action: 'evolve' }),
    resolve: (findingId, status) => run(`resolve:${findingId}`, { action: 'resolve', finding_id: findingId, status }),
  };
}