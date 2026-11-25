"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ModalContextStrip, ModalNoteBox } from "@/components/ui/ModalContextStrip";
import { formatIdDate } from "@/lib/utils/office-format";
import type { DrawingItem } from "@/types/api/drawing.types";

interface ConfirmArchiveDrawingDialogProps {
  drawing: DrawingItem | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isSubmitting: boolean;
}

export function ConfirmArchiveDrawingDialog({
  drawing,
  onClose,
  onConfirm,
  isSubmitting,
}: ConfirmArchiveDrawingDialogProps) {
  if (!drawing) return null;

  return (
    <Dialog open={Boolean(drawing)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Arsipkan Drawing?</DialogTitle>
          <DialogDescription className="text-xs">
            Gambar ini akan disembunyikan dari galeri aktif proyek.
          </DialogDescription>
        </DialogHeader>
        <ModalContextStrip
          kicker="File Drawing"
          title={drawing.fileName}
          meta={`Diunggah ${formatIdDate(drawing.uploadedAt)} · ${Math.max(1, Math.round(drawing.sizeBytes / 1024))} KB`}
        />
        <ModalNoteBox>
          Gambar lama yang diarsipkan tidak lagi tampil sebagai acuan aktif tim lapangan.
        </ModalNoteBox>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-9">
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            className="h-9"
            onClick={() => onConfirm(drawing.id)}
          >
            {isSubmitting ? "Mengarsipkan..." : "Arsipkan Drawing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
