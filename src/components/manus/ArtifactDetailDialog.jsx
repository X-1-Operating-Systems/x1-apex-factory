import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ArtifactDetailDialog({ artifact, onClose }) {
  const open = Boolean(artifact);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-[520px]">
        {artifact && (
          <>
            <DialogHeader>
              <DialogTitle className="text-[15px] font-medium leading-snug">{artifact.name}</DialogTitle>
              <DialogDescription className="text-[11.5px]">
                {artifact.type} · {artifact.engine === 'native' ? 'native engine' : 'Manus'} ·{' '}
                {artifact.task_title || 'Task'}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-1 max-h-[46vh] overflow-y-auto scroll-thin rounded-lg border border-border bg-secondary/40 p-3">
              <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-foreground/85">
                {artifact.detail?.trim() || 'No description was recorded for this deliverable.'}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {artifact.url && (
                <Button asChild size="sm" variant="outline">
                  <a href={artifact.url} target="_blank" rel="noreferrer">
                    Open file <ExternalLink size={11} />
                  </a>
                </Button>
              )}
              {artifact.task_id && (
                <Button asChild size="sm">
                  <Link to={`/task/${artifact.task_id}`} onClick={onClose}>
                    Open source task
                  </Link>
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}