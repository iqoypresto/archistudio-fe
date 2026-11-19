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
          <DialogDescription className="space-y-2 pt-2 text-sm">
            <span>
              Project <strong>{targetProject.name}</strong> (
              <span className="font-mono">{targetProject.code}</span>) akan berstatus{" "}
              <strong>SELESAI</strong> dan otomatis masuk ke folder <strong>Archive Project</strong>{" "}
              tahun ini.
            </span>
            <span className="block rounded-lg bg-status-info-bg p-2.5 text-xs font-medium text-status-info-fg">
              Setelah selesai, project bersifat baca saja dan tidak menerima laporan harian baru
              kecuali dipulihkan oleh Owner (BR-12, BR-39).
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={() => onConfirm(targetProject.id)} disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Ya, Tandai Selesai"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
