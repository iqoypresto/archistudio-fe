"use client";

import { useEffect, useMemo } from "react";
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
  areaFormSchema,
  type AreaFormValues,
} from "@/lib/validation/area.validation";
import type {
  AreaListItem,
  CreateAreaPayload,
  UpdateAreaPayload,
} from "@/types/api/area.types";

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

  const { data: usersData } = useUsersQuery({
    role: "SUPERVISOR",
    isActive: true,
    pageSize: 100,
  });

  const supervisors = useMemo(
    () => usersData?.data ?? [],
    [usersData?.data]
  );

  const {
    register,
    handleSubmit,
    reset,
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
      onSubmitUpdate(areaToEdit.id, {
        code: data.code,
        name: data.name,
      });
    } else {
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Ubah Data Area" : "Tambah Area Baru"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui kode atau nama area pada proyek ini."
              : "Tambahkan area proyek beserta penugasan supervisor aktif awal (BR-08)."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3.5 py-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="code">Kode Area (BR-13)</Label>
              <Input id="code" placeholder="A atau LT1" {...register("code")} className="uppercase" />
              {errors.code && <p className="text-status-danger-fg text-xs">{errors.code.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Nama Area</Label>
              <Input id="name" placeholder="Area Kolam Renang" {...register("name")} />
              {errors.name && <p className="text-status-danger-fg text-xs">{errors.name.message}</p>}
            </div>
          </div>

          {!isEditing && (
            <>
              <div className="space-y-1">
                <Label htmlFor="initialSupervisorId">Supervisor Aktif (BR-08)</Label>
                <select
                  id="initialSupervisorId"
                  {...register("initialSupervisorId")}
                  className="border-border bg-surface text-text-primary focus:ring-primary h-9 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
                >
                  <option value="">-- Pilih Supervisor Lapangan --</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (@{s.username}) — {s.jobTitle}
                    </option>
                  ))}
                </select>
                {errors.initialSupervisorId && (
                  <p className="text-status-danger-fg text-xs">{errors.initialSupervisorId.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="startDate">Tanggal Mulai Penugasan</Label>
                <Input id="startDate" type="date" {...register("startDate")} />
                {errors.startDate && (
                  <p className="text-status-danger-fg text-xs">{errors.startDate.message}</p>
                )}
              </div>
            </>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Area"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
