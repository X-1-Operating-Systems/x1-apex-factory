import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { AlertTriangle, Check, ChevronRight, Clock, Download, ShieldAlert, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const META = {
  ready_for_approval: { label: 'Ready for approval', icon: Clock, tone: 'text-amber-600 bg-amber-500/10' },
  approved: { label: 'Approved', icon: Check, tone: 'text-emerald-600 bg-emerald-500/10' },
  blocked: { label: 'Blocked', icon: ShieldAlert, tone: 'text-destructive bg-destructive/10' },
  superseded: { label: 'Superseded', icon: Clock, tone: 'text-muted-foreground bg-muted' },
};

const STAGE = {
  pass: { icon: Check, tone: 'text-emerald-600 bg-emerald-500/10' },
  warn: { icon: AlertTriangle, tone: 'text-amber-600 bg-amber-500/10' },
  fail: { icon: X, tone: 'text-destructive bg-destructive/10' },
  queued: { icon: ChevronRight, tone: 'text-muted-foreground bg-muted' },
  skipped: { icon: X, tone: 'text-muted-foreground bg-muted' },
};

export default function ReleaseRow({ row, onApprove, busy }) {
  const [opening, setOpening] = useState('');
  const meta = META[row.status] || META.blocked;
  const Icon = meta.icon;

  const download = async (artifact) => {
    setOpening(artifact.name);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: artifact.file_uri,
      });
      window.open(signed_url, '_blank');
    } finally {
      setOpening('');
    }
  };

  return (
    <div className="border-b border-border px-4 py-3.5 last:border-0">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10.5px] font-medium ${meta.tone}`}>
          <Icon size={11} /> {meta.label}
        </span>
        <Link to={`/studio/${row.project_id}`} className="truncate text-[13px] font-medium hover:underline">
          {row.project_name}
        </Link>
        <span className="text-[11px] text-muted-foreground">
          {row.target.replace('_', ' ')} · v{row.page_version} · {row.manifest_hash}
          {row.qa_verdict ? ` · QA ${Math.round(row.qa_score ?? 0)} (${row.qa_verdict})` : ''}
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {moment(row.created_date).format('D MMM, HH:mm')}
        </span>
        {row.status === 'ready_for_approval' && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={busy}
            onClick={() => onApprove(row)}
          >
            Approve
          </Button>
        )}
      </div>

      {(row.stages || []).length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {row.stages.map((stage) => {
            const style = STAGE[stage.status] || STAGE.queued;
            const StageIcon = style.icon;
            return (
              <span
                key={stage.key}
                title={stage.detail || ''}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[10.5px] font-medium ${style.tone}`}
              >
                <StageIcon size={9} /> {stage.label}
              </span>
            );
          })}
        </div>
      )}

      {(row.artifacts || []).length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {row.artifacts.map((artifact) => (
            <button
              key={artifact.name}
              type="button"
              onClick={() => download(artifact)}
              disabled={opening === artifact.name}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-[3px] text-[10.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              <Download size={9} /> {artifact.name}
            </button>
          ))}
        </div>
      )}

      {row.notes && <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{row.notes}</p>}
    </div>
  );
}