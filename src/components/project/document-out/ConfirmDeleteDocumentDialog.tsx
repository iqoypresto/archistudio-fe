"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProjectDocumentItem } from "@/types/api/project-document.types";

interface ConfirmDeleteDocumentDialogProps {
  targetDocument: ProjectDocumentItem | null;
  onClose: () => void;
  onConfirm: (documentId: string) => void;
  isDeleting: boolean;
}

export function ConfirmDeleteDocumentDialog({
  targetDocument,
  onClose,
  onConfirm,
  isDeleting,
}: ConfirmDeleteDocumentDialogProps) {
  if (!targetDocument) return null;

  return (
    <Dialog open={Boolean(targetDocument)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus Permanen Dokumen?</DialogTitle>
          <DialogDescription className="space-y-2 pt-2 text-sm">
            <span>
              File <strong>{targetDocument.fileName}</strong> akan dihapus secara permanen dari
              daftar dokumen keluar dan penyimpanan storage (BR-34).
            </span>
            <span className="block rounded-lg bg-status-danger-bg/60 p-2.5 text-xs font-medium text-status-danger-fg">
              Tindakan ini tidak dapat dibatalkan karena dokumen keluar tidak memiliki fitur arsip.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(targetDocument.id)}
            disabled={isDeleting}
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus Permanen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
