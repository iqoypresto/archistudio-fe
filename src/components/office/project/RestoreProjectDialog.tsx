"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  restoreProjectSchema,
  type RestoreProjectFormValues,
} from "@/lib/validation/project.validation";
import type { ProjectListItem, RestoreProjectPayload } from "@/types/api/project.types";

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
    register,
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

  const onFormSubmit = (data: RestoreProjectFormValues) => {
    onConfirm(targetProject.id, data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pulihkan Project dari Archive</DialogTitle>
          <DialogDescription>
            Pilih status aktif tujuan untuk memulihkan <strong>{targetProject.name}</strong> (
            <span className="font-mono">{targetProject.code}</span>) kembali ke daftar project
            aktif (BR-39).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="restore-status">Status Setelah Dipulihkan</Label>
            <select
              id="restore-status"
              {...register("status")}
              className="border-border bg-surface text-text-primary focus:ring-primary h-11 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
            >
              <option value="PERSIAPAN">Persiapan</option>
              <option value="BERJALAN">Berjalan</option>
            </select>
            {errors.status && (
              <p className="text-status-danger-fg text-xs">{errors.status.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Memulihkan..." : "Pulihkan Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
