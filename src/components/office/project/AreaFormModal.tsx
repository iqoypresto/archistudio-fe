"use client";

import { useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsersQuery } from "@/hooks/user.hooks";
import { isFieldRole } from "@/lib/utils/role";
import { areaFormSchema, type AreaFormValues } from "@/lib/validation/area.validation";
import type { AreaListItem, CreateAreaPayload, UpdateAreaPayload } from "@/types/api/area.types";

interface AreaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaToEdit: AreaListItem | null;
  onSubmitCreate: (data: CreateAreaPayload) => void;
  onSubmitUpdate: (areaId: string, data: UpdateAreaPayload) => void;
  isSubmitting: boolean;
}

export function AreaFormModal({
  isOpen,
  onClose,
  areaToEdit,
  onSubmitCreate,
  onSubmitUpdate,
  isSubmitting,
}: AreaFormModalProps) {
  const isEditing = Boolean(areaToEdit);
  const { data: usersData, isLoading } = useUsersQuery(
    { isActive: true, pageSize: 100 },
    { enabled: isOpen && !isEditing },
  );
  const supervisors = useMemo(
    () => (usersData?.data ?? []).filter((u) => isFieldRole(u.role)),
    [usersData?.data],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      code: "",
      name: "",
      initialSupervisorId: "",
      startDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (areaToEdit) {
      reset({
        code: areaToEdit.code,
        name: areaToEdit.name,
        initialSupervisorId: "",
        startDate: "",
      });
    } else {
      reset({
        code: "",
        name: "",
        initialSupervisorId: supervisors[0]?.id ?? "",
        startDate: new Date().toISOString().slice(0, 10),
      });
    }
  }, [areaToEdit, reset, isOpen, supervisors]);

  const onFormSubmit = (data: AreaFormValues) => {
    if (isEditing && areaToEdit) {
      onSubmitUpdate(areaToEdit.id, { code: data.code, name: data.name });
      return;
    }
    if (!data.initialSupervisorId) {
      setError("initialSupervisorId", { message: "Pilih supervisor awal untuk area ini." });
      return;
    }
    if (!data.startDate) {
      setError("startDate", { message: "Pilih tanggal mulai penugasan." });
      return;
    }
    onSubmitCreate({
      code: data.code,
      name: data.name,
      initialSupervisorId: data.initialSupervisorId,
      startDate: data.startDate,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Ubah Data Area" : "Tambah Area Baru"}</DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Perbarui kode atau nama area pada proyek ini."
              : "Tambahkan area proyek beserta penugasan supervisor aktif awal."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-medium">Kode Area</Label>
              <Input id="code" placeholder="AR-01" className="h-9 text-xs uppercase" {...register("code")} />
              {errors.code && <p className="text-xs text-status-danger-fg">{errors.code.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">Nama Area</Label>
              <Input id="name" placeholder="Area Kolam Renang" className="h-9 text-xs" {...register("name")} />
              {errors.name && <p className="text-xs text-status-danger-fg">{errors.name.message}</p>}
            </div>
          </div>

          {!isEditing && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="initialSupervisorId" className="text-xs font-medium">Supervisor Aktif</Label>
                <Controller
                  name="initialSupervisorId"
                  control={control}
                  render={({ field }) => {
                    const selected = supervisors.find((s) => s.id === field.value);
                    const label = selected
                      ? `${selected.name} (@${selected.username}) · ${selected.jobTitle}`
                      : undefined;
                    return (
                      <Select
                        value={field.value ?? ""}
                        disabled={isLoading}
                        onValueChange={(val: string | null) => field.onChange(val ?? "")}
                      >
                        <SelectTrigger id="initialSupervisorId" className="h-9 text-xs">
                          <SelectValue placeholder={isLoading ? "Memuat supervisor..." : "Pilih supervisor aktif"}>
                            {label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {supervisors.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} (@{s.username}) · {s.jobTitle}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                <p className="text-[11px] text-text-muted">
                  Supervisor yang sedang bertugas di area atau proyek lain tetap dapat dipilih.
                </p>
                {errors.initialSupervisorId && (
                  <p className="text-xs text-status-danger-fg">{errors.initialSupervisorId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-xs font-medium">Tanggal Mulai Penugasan</Label>
                <Input id="startDate" type="date" className="h-9 text-xs tabular-nums" {...register("startDate")} />
                {errors.startDate && <p className="text-xs text-status-danger-fg">{errors.startDate.message}</p>}
              </div>
            </>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-9">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-9">
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Area"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
