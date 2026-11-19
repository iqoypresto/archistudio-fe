"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
          <DialogTitle>Arsipkan Project Secara Manual?</DialogTitle>
          <DialogDescription className="space-y-2 pt-2 text-sm">
            <span>
              Project <strong>{targetProject.name}</strong> (
              <span className="font-mono">{targetProject.code}</span>) akan dipindahkan ke
              halaman <strong>Archive Project</strong> pada folder tahun ini.
            </span>
            <span className="block rounded-lg bg-status-warning-bg p-2.5 text-xs font-medium text-status-warning-fg">
              Project yang diarsipkan menjadi baca saja dan tidak menerima laporan harian baru
              hingga dipulihkan kembali oleh Owner (BR-12, BR-39).
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(targetProject.id)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Mengarsipkan..." : "Ya, Arsipkan Manual"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
