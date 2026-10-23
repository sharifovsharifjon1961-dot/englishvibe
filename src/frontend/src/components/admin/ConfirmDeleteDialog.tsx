import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  /** Human label of the record about to be removed. */
  label: string;
  /** Singular noun, e.g. "mock test". */
  noun: string;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmation step shown before any record is deleted. */
export function ConfirmDeleteDialog({
  open,
  label,
  noun,
  pending,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent data-ocid="admin.delete_dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this {noun}?</AlertDialogTitle>
          <AlertDialogDescription>
            “{label}” will be removed from the student-facing content. This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-ocid="admin.delete_cancel_button"
            onClick={onCancel}
          >
            Keep it
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="admin.delete_confirm_button"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
