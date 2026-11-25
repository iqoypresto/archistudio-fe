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
import { ModalContextStrip, ModalNoteBox } from "@/components/ui/ModalContextStrip";
import { formatIdDate } from "@/lib/utils/office-format";
import { getDocumentTypeLabel } from "@/lib/validation/project-document.validation";
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
          <DialogDescription className="text-xs">
            Dokumen ini akan dihapus permanen dari daftar proyek dan penyimpanan.
          </DialogDescription>
        </DialogHeader>

        <ModalContextStrip
          kicker={getDocumentTypeLabel(targetDocument.type)}
          title={targetDocument.fileName}
          meta={`Diunggah ${formatIdDate(targetDocument.uploadedAt)} · ${Math.max(1, Math.round(targetDocument.sizeBytes / 1024))} KB`}
        />

        <ModalNoteBox>
          Tindakan ini tidak dapat dibatalkan karena dokumen keluar tidak memiliki fitur arsip.
        </ModalNoteBox>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting} className="h-9">
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(targetDocument.id)}
            disabled={isDeleting}
            className="h-9"
          >
            {isDeleting ? "Menghapus..." : "Hapus Permanen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
