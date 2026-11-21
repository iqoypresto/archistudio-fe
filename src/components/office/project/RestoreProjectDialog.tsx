"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val: string | null) =>
                    field.onChange(val === "PERSIAPAN" ? "PERSIAPAN" : "BERJALAN")
                  }
                >
                  <SelectTrigger id="restore-status" className="h-10">
                    <SelectValue placeholder="Pilih Status">
                      {field.value === "PERSIAPAN" ? "Persiapan" : "Berjalan"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERSIAPAN">Persiapan</SelectItem>
                    <SelectItem value="BERJALAN">Berjalan</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
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
