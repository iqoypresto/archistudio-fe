"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ModalContextStrip, ModalNoteBox } from "@/components/ui/ModalContextStrip";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  restoreProjectSchema,
  type RestoreProjectFormValues,
} from "@/lib/validation/project.validation";
import type {
  ActiveProjectStatus,
  ProjectListItem,
  RestoreProjectPayload,
} from "@/types/api/project.types";

const RESTORE_STATUS_OPTIONS: readonly { value: ActiveProjectStatus; label: string }[] = [
  { value: "BERJALAN", label: "Berjalan" },
  { value: "PERSIAPAN", label: "Persiapan" },
];

interface RestoreProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetProject: ProjectListItem | null;
  onConfirm: (projectId: string, payload: RestoreProjectPayload) => void;
  isSubmitting: boolean;
}

export function RestoreProjectDialog({
  isOpen,
  onClose,
  targetProject,
  onConfirm,
  isSubmitting,
}: RestoreProjectDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RestoreProjectFormValues>({
    resolver: zodResolver(restoreProjectSchema),
    defaultValues: { status: "BERJALAN" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ status: "BERJALAN" });
    }
  }, [isOpen, reset, targetProject?.id]);

  if (!targetProject) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pulihkan Project</DialogTitle>
          <DialogDescription className="text-xs">
            Kembalikan proyek ke daftar proyek aktif.
          </DialogDescription>
        </DialogHeader>

        <ModalContextStrip
          kicker={`${targetProject.code} · ${targetProject.status === "SELESAI" ? "Selesai" : "Arsip Manual"}`}
          title={targetProject.name}
          meta={`${targetProject.clientName} · ${targetProject.location}`}
        />

        <form onSubmit={handleSubmit((data) => onConfirm(targetProject.id, data))} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Status Setelah Dipulihkan</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <SegmentedControl
                  ariaLabel="Status setelah dipulihkan"
                  fullWidth
                  options={RESTORE_STATUS_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.status && <p className="text-xs text-status-danger-fg">{errors.status.message}</p>}
          </div>

          <ModalNoteBox>
            Proyek akan kembali aktif dan pengawas area dapat melanjutkan pelaporan harian sesuai
            jadwal.
          </ModalNoteBox>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-9">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-9">
              {isSubmitting ? "Memulihkan..." : "Pulihkan Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
