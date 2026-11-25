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

interface ConfirmCompleteProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetProject: ProjectListItem | null;
  onConfirm: (projectId: string) => void;
  isSubmitting: boolean;
}

export function ConfirmCompleteProjectDialog({
  isOpen,
  onClose,
  targetProject,
  onConfirm,
  isSubmitting,
}: ConfirmCompleteProjectDialogProps) {
  if (!targetProject) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tandai Project Selesai?</DialogTitle>
          <DialogDescription className="text-xs">
            Proyek akan otomatis masuk ke Archive Project tahun ini.
          </DialogDescription>
        </DialogHeader>

        <ModalContextStrip
          kicker={`${targetProject.code} · ${targetProject.status === "BERJALAN" ? "Berjalan" : "Persiapan"}`}
          title={targetProject.name}
          meta={`${targetProject.clientName} · ${targetProject.location}`}
        />

        <ModalNoteBox>
          Setelah berstatus Selesai, seluruh data proyek menjadi baca saja dan tidak menerima
          laporan harian baru kecuali dipulihkan kembali oleh Owner.
        </ModalNoteBox>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-9">
            Batal
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(targetProject.id)}
            disabled={isSubmitting}
            className="h-9"
          >
            {isSubmitting ? "Memproses..." : "Tandai Selesai"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
