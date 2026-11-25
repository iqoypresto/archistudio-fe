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
import type { ProjectListItem } from "@/types/api/project.types";

interface ConfirmArchiveProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetProject: ProjectListItem | null;
  onConfirm: (projectId: string) => void;
  isSubmitting: boolean;
}

export function ConfirmArchiveProjectDialog({
  isOpen,
  onClose,
  targetProject,
  onConfirm,
  isSubmitting,
}: ConfirmArchiveProjectDialogProps) {
  if (!targetProject) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Arsipkan Project Manual?</DialogTitle>
          <DialogDescription className="text-xs">
            Pindahkan proyek ke Archive Project tahun ini.
          </DialogDescription>
        </DialogHeader>

        <ModalContextStrip
          kicker={`${targetProject.code} · ${targetProject.status === "BERJALAN" ? "Berjalan" : "Persiapan"}`}
          title={targetProject.name}
          meta={`${targetProject.clientName} · ${targetProject.location}`}
        />

        <ModalNoteBox>
          Proyek yang diarsipkan menjadi baca saja dan tidak menerima laporan harian baru. Seluruh
          riwayat tetap tersimpan dan dapat dipulihkan oleh Owner.
        </ModalNoteBox>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-9">
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(targetProject.id)}
            disabled={isSubmitting}
            className="h-9"
          >
            {isSubmitting ? "Mengarsipkan..." : "Arsipkan Manual"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
