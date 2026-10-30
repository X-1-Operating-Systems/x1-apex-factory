import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import moment from 'moment';
import { Check, ShieldAlert, Clock, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const META = {
  ready_for_approval: { label: 'Ready for approval', icon: Clock, tone: 'text-amber-600 bg-amber-500/10' },
  approved: { label: 'Approved', icon: Check, tone: 'text-emerald-600 bg-emerald-500/10' },
  blocked: { label: 'Blocked', icon: ShieldAlert, tone: 'text-destructive bg-destructive/10' },
  superseded: { label: 'Superseded', icon: Clock, tone: 'text-muted-foreground bg-muted' },
};

export default function Releases() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const page = await base44.entities.Deployment.filter({}, { sort: '-created_date', limit: 60 });
    setRows(page.items);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (row) => {
    await base44.entities.Deployment.update(row.id, { status: 'approved' });
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'approved' } : r)));
  };

  return (
    <div className="mx-auto w-full max-w-[1080px] px-5 py-8 lg:px-10 lg:py-12">
      <h1 className="text-[15px] font-medium">Releases</h1>
      <p className="mt-1.5 max-w-[62ch] text-[12.5px] leading-relaxed text-muted-foreground">
        Each record pins a page version, its review score and a manifest hash, so an approval always points at exactly
        one build.
      </p>

      <div className="mt-5 rounded-xl border border-border bg-card px-4 py-3 text-[11.5px] leading-relaxed text-muted-foreground">
        Manifests are prepared here. Pushing to Vercel, Railway, GitHub or Supabase runs once those accounts are
        connected — an approved record is the handoff point, not a live site.
      </div>

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
            Open a project, run a review, then prepare a release from the studio header.
          </p>
          <Link to="/" className="mt-5 inline-flex items-center gap-1 text-[12px] font-medium text-primary">
            Go to projects <ArrowUpRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
          {rows.map((row) => {
            const meta = META[row.status] || META.blocked;
            const Icon = meta.icon;
            return (
              <div key={row.id} className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3.5 last:border-0">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10.5px] font-medium ${meta.tone}`}>
                  <Icon size={11} /> {meta.label}
                </span>
                <div className="min-w-0 flex-1">
                  <Link to={`/studio/${row.project_id}`} className="truncate text-[13px] font-medium hover:underline">
                    {row.project_name}
                  </Link>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {row.target} · v{row.page_version} · {row.manifest_hash} · QA {Math.round(row.qa_score ?? 0)}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground">{moment(row.created_date).format('D MMM, HH:mm')}</span>
                {row.status === 'ready_for_approval' && (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => approve(row)}>
                    Approve
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}