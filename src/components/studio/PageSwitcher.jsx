import React, { useState } from 'react';
import { ChevronDown, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PageDialog from '@/components/studio/PageDialog';

export default function PageSwitcher({ pages, current, onSelect, onCreate, onSave, onDelete }) {
  const [dialog, setDialog] = useState(null);
  const [removing, setRemoving] = useState(null);

  const editing = dialog?.mode === 'edit' ? dialog.page : null;
  const takenPaths = pages.filter((entry) => entry.id !== editing?.id).map((entry) => entry.path || '/');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Pages in this project"
            className="flex h-7 max-w-[180px] shrink-0 items-center gap-1 rounded-full border border-border px-2 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <FileText size={11} />
            <span className="truncate">{current?.name || 'Page'}</span>
            <span className="hidden shrink-0 text-muted-foreground/70 sm:inline">{current?.path || '/'}</span>
            <ChevronDown size={11} className="shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          {pages.map((entry) => (
            <DropdownMenuItem key={entry.id} onSelect={() => onSelect(entry.id)} className="gap-1.5">
              <span className={`min-w-0 flex-1 truncate text-[12px] ${entry.id === current?.id ? 'font-medium' : ''}`}>
                {entry.name}
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground">{entry.path || '/'}</span>
              <button
                type="button"
                aria-label={`Edit ${entry.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setDialog({ mode: 'edit', page: entry });
                }}
                className="grid h-5 w-5 shrink-0 place-items-center rounded-full hover:bg-secondary"
              >
                <Pencil size={10} />
              </button>
              {pages.length > 1 && (
                <button
                  type="button"
                  aria-label={`Delete ${entry.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setRemoving(entry);
                  }}
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setDialog({ mode: 'new' })} className="gap-1.5 text-[12px]">
            <Plus size={12} /> New page
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PageDialog
        open={!!dialog}
        onOpenChange={(next) => !next && setDialog(null)}
        page={editing}
        takenPaths={takenPaths}
        onSave={(values) => (editing ? onSave(editing.id, values) : onCreate(values))}
      />

      <AlertDialog open={!!removing} onOpenChange={(next) => !next && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[16px] font-medium">Delete {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Its {removing?.blocks?.length || 0} sections and SEO are removed from this project for good.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep page</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await onDelete(removing.id);
                setRemoving(null);
              }}
            >
              Delete page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}