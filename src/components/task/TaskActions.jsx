import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, RotateCcw, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteTask, rerunTask } from '@/lib/taskEngine';

const PILL =
  'inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50';

export default function TaskActions({ task, engine, onError }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Rerun and delete act on studio task records; a Manus run only exists on
  // their side, so it keeps the single "Open in Manus" path.
  if (engine !== 'native' || !task?.id) return null;

  const fail = (err) => onError?.(err?.response?.data?.error || err.message);

  const rerun = async () => {
    setBusy('rerun');
    try {
      const res = await rerunTask(task);
      navigate(`/task/${res.task_id}`);
    } catch (err) {
      fail(err);
    } finally {
      setBusy('');
    }
  };

  const remove = async () => {
    setBusy('delete');
    try {
      await deleteTask(task.id);
      navigate('/library', { replace: true });
    } catch (err) {
      fail(err);
      setBusy('');
    }
  };

  return (
    <>
      {task.instruction && (
        <button type="button" onClick={rerun} disabled={Boolean(busy)} className={PILL}>
          {busy === 'rerun' ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />} Rerun
        </button>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogTrigger asChild>
          <button type="button" disabled={Boolean(busy)} className={PILL}>
            {busy === 'delete' ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />} Delete
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px] font-medium">Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              Its run history and deliverable are removed with it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete task</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}