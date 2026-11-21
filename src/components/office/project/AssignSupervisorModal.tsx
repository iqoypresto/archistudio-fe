"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useUsersQuery } from "@/hooks/user.hooks";
import { filterAssignableSupervisors } from "@/lib/validation/area-access";
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
  const { data: usersData, isLoading, isError, refetch } = useUsersQuery(
    { role: "SUPERVISOR", isActive: true, pageSize: 100 },
    { enabled: isOpen },
  );

  const activeAssignment = targetArea?.activeAssignment;
  const assignableSupervisors = filterAssignableSupervisors(
    usersData?.data ?? [],
    activeAssignment?.supervisorId,
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
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

  const isReplacing = Boolean(activeAssignment);
  const onFormSubmit = (data: AssignSupervisorFormValues) => {
    onSubmit(targetArea.id, data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isReplacing ? "Ganti" : "Tugaskan"} Supervisor Area {targetArea.code}
          </DialogTitle>
          <DialogDescription>
            Pilih supervisor aktif untuk area <strong>{targetArea.name}</strong> (BR-09, BR-10).
          </DialogDescription>
        </DialogHeader>

        {activeAssignment && (
          <div className="rounded-lg bg-surface-subtle p-3 text-xs">
            <span className="font-semibold text-text-primary">Supervisor Aktif Saat Ini:</span>
            <div className="mt-1 text-text-secondary">
              {activeAssignment.supervisor.name} (@{activeAssignment.supervisor.username}) • Bertugas
              sejak {activeAssignment.startDate.slice(0, 10)}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3.5 py-1">
          <div className="space-y-1">
            <Label htmlFor="supervisorId">
              {isReplacing ? "Supervisor Baru" : "Supervisor Aktif"}
            </Label>
            <Controller
              name="supervisorId"
              control={control}
              render={({ field }) => {
                const selected = assignableSupervisors.find((s) => s.id === field.value);
                const label = selected
                  ? `${selected.name} (@${selected.username}) — ${selected.jobTitle}`
                  : undefined;
                return (
                  <Select
                    value={field.value}
                    disabled={isLoading || isError}
                    onValueChange={(val: string | null) => field.onChange(val ?? "")}
                  >
                    <SelectTrigger id="supervisorId" className="h-10">
                      <SelectValue
                        placeholder={isLoading ? "Memuat daftar supervisor..." : "-- Pilih Supervisor Aktif --"}
                      >
                        {label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {assignableSupervisors.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} (@{s.username}) — {s.jobTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            <p className="text-text-secondary text-xs">
              Supervisor yang sedang aktif di area atau project lain tetap dapat dipilih (BR-09).
            </p>
            {isError && (
              <div className="flex items-center gap-2 text-xs text-status-danger-fg">
                <span>Gagal memuat daftar supervisor.</span>
                <button type="button" onClick={() => refetch()} className="underline">
                  Coba lagi
                </button>
              </div>
            )}
            {!isLoading && !isError && assignableSupervisors.length === 0 && (
              <p className="text-status-warning-fg text-xs">
                Tidak ada kandidat supervisor aktif lain yang tersedia.
              </p>
            )}
            {errors.supervisorId && (
              <p className="text-status-danger-fg text-xs">{errors.supervisorId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="effectiveStartDate">Tanggal Efektif Bertugas</Label>
            <Input
              id="effectiveStartDate"
              type="date"
              className="h-11"
              {...register("effectiveStartDate")}
            />
            {errors.effectiveStartDate && (
              <p className="text-status-danger-fg text-xs">
                {errors.effectiveStartDate.message}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-status-info-bg p-2.5 text-xs text-status-info-fg">
            {isReplacing
              ? "Penugasan supervisor sebelumnya otomatis ditutup pada H-1 tanggal efektif baru tanpa mengubah laporan historis (BR-10)."
              : "Supervisor yang dipilih akan langsung aktif melapor pada area ini mulai tanggal efektif (BR-08, BR-09)."}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Menugaskan..." : "Konfirmasi Penugasan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
