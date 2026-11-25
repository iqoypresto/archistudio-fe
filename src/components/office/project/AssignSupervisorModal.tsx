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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalContextStrip, ModalNoteBox } from "@/components/ui/ModalContextStrip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsersQuery } from "@/hooks/user.hooks";
import { formatIdDate } from "@/lib/utils/office-format";
import { isFieldRole } from "@/lib/utils/role";
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
    { isActive: true, pageSize: 100 },
    { enabled: isOpen },
  );

  const activeAssignment = targetArea?.activeAssignment;
  const assignableSupervisors = filterAssignableSupervisors(
    (usersData?.data ?? []).filter((u) => isFieldRole(u.role)),
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isReplacing ? "Ganti Pengawas Area" : "Tugaskan Pengawas Area"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Tetapkan pengawas lapangan aktif untuk area {targetArea.code} · {targetArea.name}.
          </DialogDescription>
        </DialogHeader>

        {activeAssignment && (
          <ModalContextStrip
            kicker={`Pengawas aktif saat ini · Area ${targetArea.code}`}
            title={activeAssignment.supervisor.name}
            meta={`@${activeAssignment.supervisor.username} · Bertugas sejak ${formatIdDate(activeAssignment.startDate)}`}
          />
        )}

        <form onSubmit={handleSubmit((data) => onSubmit(targetArea.id, data))} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="supervisorId" className="text-xs font-medium">
              {isReplacing ? "Supervisor Pengganti" : "Supervisor Aktif"}
            </Label>
            <Controller
              name="supervisorId"
              control={control}
              render={({ field }) => {
                const selected = assignableSupervisors.find((s) => s.id === field.value);
                const label = selected
                  ? `${selected.name} (@${selected.username}) · ${selected.jobTitle}`
                  : undefined;
                return (
                  <Select
                    value={field.value}
                    disabled={isLoading || isError}
                    onValueChange={(val: string | null) => field.onChange(val ?? "")}
                  >
                    <SelectTrigger id="supervisorId" className="h-9 text-xs">
                      <SelectValue
                        placeholder={isLoading ? "Memuat daftar supervisor..." : "Pilih supervisor aktif"}
                      >
                        {label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {assignableSupervisors.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} (@{s.username}) · {s.jobTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            {isError && (
              <div className="flex items-center gap-2 text-xs text-status-danger-fg">
                <span>Gagal memuat daftar supervisor.</span>
                <button type="button" onClick={() => refetch()} className="underline">
                  Coba lagi
                </button>
              </div>
            )}
            {!isLoading && !isError && assignableSupervisors.length === 0 && (
              <p className="text-xs text-status-warning-fg">
                Tidak ada kandidat supervisor aktif lain yang tersedia.
              </p>
            )}
            {errors.supervisorId && (
              <p className="text-xs text-status-danger-fg">{errors.supervisorId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="effectiveStartDate" className="text-xs font-medium">
              Tanggal Efektif Bertugas
            </Label>
            <Input
              id="effectiveStartDate"
              type="date"
              className="h-9 text-xs tabular-nums"
              {...register("effectiveStartDate")}
            />
            {errors.effectiveStartDate && (
              <p className="text-xs text-status-danger-fg">{errors.effectiveStartDate.message}</p>
            )}
          </div>

          <ModalNoteBox>
            {isReplacing
              ? "Penugasan pengawas sebelumnya otomatis ditutup pada H-1 tanggal efektif baru tanpa mengubah laporan historis."
              : "Supervisor yang dipilih akan langsung aktif melapor pada area ini mulai tanggal efektif."}
          </ModalNoteBox>

          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-9">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading} className="h-9">
              {isSubmitting ? "Menyimpan..." : "Konfirmasi Penugasan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
