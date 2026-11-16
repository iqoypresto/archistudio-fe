"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsersQuery } from "@/hooks/user.hooks";
import {
  assignSupervisorFormSchema,
  type AssignSupervisorFormValues,
} from "@/lib/validation/area.validation";
import type { AreaListItem, AssignSupervisorPayload } from "@/types/api/area.types";

interface AssignSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetArea: AreaListItem | null;
  onSubmit: (areaId: string, data: AssignSupervisorPayload) => void;
  isSubmitting: boolean;
}

export function AssignSupervisorModal({
  isOpen,
  onClose,
  targetArea,
  onSubmit,
  isSubmitting,
}: AssignSupervisorModalProps) {
  const { data: usersData } = useUsersQuery({
    role: "SUPERVISOR",
    isActive: true,
    pageSize: 100,
  });

  const supervisors = usersData?.data ?? [];
  const activeAssignment = targetArea?.activeAssignment;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignSupervisorFormValues>({
    resolver: zodResolver(assignSupervisorFormSchema),
    defaultValues: {
      supervisorId: "",
      effectiveStartDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    reset({
      supervisorId: "",
      effectiveStartDate: new Date().toISOString().slice(0, 10),
    });
  }, [targetArea, reset, isOpen]);

  if (!targetArea) return null;

  const onFormSubmit = (data: AssignSupervisorFormValues) => {
    onSubmit(targetArea.id, data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ganti Supervisor Area {targetArea.code}</DialogTitle>
          <DialogDescription>
            Tugaskan supervisor baru untuk area <strong>{targetArea.name}</strong> (BR-10).
          </DialogDescription>
        </DialogHeader>

        {activeAssignment && (
          <div className="rounded-lg bg-surface-subtle p-3 text-xs">
            <span className="font-semibold text-text-primary">Supervisor Aktif Saat Ini:</span>
            <div className="mt-1 text-text-secondary">
              {activeAssignment.supervisor.name} (@{activeAssignment.supervisor.username}) • Bertugas sejak{" "}
              {activeAssignment.startDate.slice(0, 10)}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3.5 py-1">
          <div className="space-y-1">
            <Label htmlFor="supervisorId">Supervisor Baru</Label>
            <select
              id="supervisorId"
              {...register("supervisorId")}
              className="border-border bg-surface text-text-primary focus:ring-primary h-9 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
            >
              <option value="">-- Pilih Supervisor Baru --</option>
              {supervisors
                .filter((s) => s.id !== activeAssignment?.supervisorId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (@{s.username}) — {s.jobTitle}
                  </option>
                ))}
            </select>
            {errors.supervisorId && (
              <p className="text-status-danger-fg text-xs">{errors.supervisorId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="effectiveStartDate">Tanggal Efektif Bertugas</Label>
            <Input id="effectiveStartDate" type="date" {...register("effectiveStartDate")} />
            {errors.effectiveStartDate && (
              <p className="text-status-danger-fg text-xs">
                {errors.effectiveStartDate.message}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-status-info-bg p-2.5 text-xs text-status-info-fg">
            Penugasan supervisor sebelumnya akan otomatis ditutup pada H-1 tanggal efektif baru.
            Seluruh laporan harian yang telah terkirim tetap mencantumkan paraf supervisor sebelumnya (BR-10).
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menugaskan..." : "Konfirmasi Penugasan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
