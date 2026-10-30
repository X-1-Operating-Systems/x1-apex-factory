import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReleaseRow from '@/components/releases/ReleaseRow';
import KeyNotice from '@/components/system/KeyNotice';

export default function Releases() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState('');
  const [error, setError] = useState('');
  const [links, setLinks] = useState({});
  const [handingOff, setHandingOff] = useState('');
  const [revoking, setRevoking] = useState('');

  const load = async () => {
    const page = await base44.entities.Deployment.filter({}, { sort: '-created_date', limit: 60 });
    setRows(page.items);
    setLoading(false);

    if (page.items.length) {
      const found = await base44.entities.ShareLink.filter({
        deployment_id: { $in: page.items.map((row) => row.id) },
      });
      const map = {};
      (found || []).forEach((link) => {
        if (!link.revoked) map[link.deployment_id] = link;
      });
      setLinks(map);
    } else {
      setLinks({});
    }
  };

  const handOff = async (row) => {
    setHandingOff(row.id);
    setError('');
    try {
      const res = await base44.functions.invoke('shareLink', { action: 'handoff', deployment_id: row.id });
      setLinks((prev) => ({ ...prev, [row.id]: res.data.link }));
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setHandingOff('');
    }
  };

  const revokeHandoff = async (row) => {
    const link = links[row.id];
    if (!link) return;
    setRevoking(row.id);
    setError('');
    try {
      await base44.functions.invoke('shareLink', { action: 'revoke', id: link.id });
      setLinks((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setRevoking('');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (row) => {
    setApproving(row.id);
    setError('');
    try {
      const res = await base44.functions.invoke('deployRelease', { action: 'approve', deployment_id: row.id });
      setRows((prev) => prev.map((r) => (r.id === row.id ? res.data.deployment : r)));
      await load();
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setApproving('');
    }
  };

  const pending = rows.filter((row) => row.status === 'ready_for_approval').length;
  const approved = rows.filter((row) => row.status === 'approved').length;

  return (
    <div className="mx-auto w-full max-w-[1080px] px-5 py-8 lg:px-10 lg:py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[15px] font-medium">Releases</h1>
        <p className="text-[11.5px] text-muted-foreground">
          {pending} awaiting approval · {approved} approved
        </p>
      </div>
      <p className="mt-1.5 max-w-[62ch] text-[12.5px] leading-relaxed text-muted-foreground">
        Every release freezes one page version, reviews it, then packages a deployable bundle. The manifest hash pins
        the exact build, so an approval always points at one thing.
      </p>

      <div className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-[11.5px] leading-relaxed text-muted-foreground">
        Bundles download from each release — the exported page plus the config file your target needs (vercel.json,
        Dockerfile, or a GitHub Pages workflow). Pushing straight to an account still needs that account connected.
      </div>

      <KeyNotice surfaceKey="Release deploy" />

      {error && <p className="mt-3 text-[11.5px] text-destructive">{error}</p>}

      {loading ? (
        <div className="mt-6 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <p className="text-[15px] font-medium">Nothing prepared yet</p>
          <p className="mx-auto mt-2 max-w-[44ch] text-[12.5px] leading-relaxed text-muted-foreground">
            Open a project and prepare a release from the studio header — it gets reviewed, frozen and bundled here.
          </p>
          <Link to="/" className="mt-5 inline-flex items-center gap-1 text-[12px] font-medium text-primary">
            Go to projects <ArrowUpRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
          {rows.map((row) => (
            <ReleaseRow
              key={row.id}
              row={row}
              onApprove={approve}
              busy={approving === row.id}
              handoff={links[row.id] || null}
              onHandoff={handOff}
              onRevoke={revokeHandoff}
              handingOff={handingOff === row.id}
              revoking={revoking === row.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}