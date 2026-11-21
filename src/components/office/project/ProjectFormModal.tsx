"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import {
  TIMEZONE_OPTIONS, projectFormSchema, type ProjectFormValues,
} from "@/lib/validation/project.validation";
import type {
  CreateProjectPayload, ProjectListItem, UpdateProjectPayload,
} from "@/types/api/project.types";
import { RoutineHolidaysField } from "./RoutineHolidaysField";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit: ProjectListItem | null;
  onSubmitCreate: (data: CreateProjectPayload) => void;
  onSubmitUpdate: (id: string, data: UpdateProjectPayload) => void;
  isSubmitting: boolean;
}

const defaultValues: ProjectFormValues = {
  code: "", name: "", location: "", clientName: "",
  startDate: new Date().toISOString().slice(0, 10), endDate: "",
  status: "PERSIAPAN", timezone: "Asia/Jakarta", routineHolidays: [0],
};

export function ProjectFormModal({
  isOpen, onClose, projectToEdit, onSubmitCreate, onSubmitUpdate, isSubmitting,
}: ProjectFormModalProps) {
  const isEditing = Boolean(projectToEdit);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (projectToEdit) {
      reset({
        code: projectToEdit.code,
        name: projectToEdit.name,
        location: projectToEdit.location,
        clientName: projectToEdit.clientName,
        startDate: projectToEdit.startDate?.slice(0, 10) ?? "",
        endDate: projectToEdit.endDate?.slice(0, 10) ?? "",
        status: projectToEdit.status === "BERJALAN" ? "BERJALAN" : "PERSIAPAN",
        timezone: projectToEdit.timezone,
        routineHolidays: projectToEdit.routineHolidays ?? [0],
      });
    } else {
      reset(defaultValues);
    }
  }, [projectToEdit, reset, isOpen]);

  const onFormSubmit = (data: ProjectFormValues) => {
    const payload = {
      ...data,
      endDate: data.endDate && data.endDate.trim() !== "" ? data.endDate : null,
    };
    if (isEditing && projectToEdit) {
      onSubmitUpdate(projectToEdit.id, payload);
    } else {
      onSubmitCreate(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Ubah Data Project" : "Tambah Project Baru"}</DialogTitle>
          <DialogDescription>
            Konfigurasi identitas proyek, jadwal, zona waktu, dan hari libur rutin (BR-07, BR-11).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-3 py-1">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="code">Kode Project (BR-13)</Label>
              <Input id="code" placeholder="VLA01" {...register("code")} className="uppercase" />
              {errors.code && <p className="text-status-danger-fg text-xs">{errors.code.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Nama Project</Label>
              <Input id="name" placeholder="Villa Ubud Bali" {...register("name")} />
              {errors.name && <p className="text-status-danger-fg text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="clientName">Nama Client</Label>
              <Input id="clientName" placeholder="PT Graha Indah" {...register("clientName")} />
              {errors.clientName && <p className="text-status-danger-fg text-xs">{errors.clientName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="location">Lokasi Proyek</Label>
              <Input id="location" placeholder="Ubud, Gianyar, Bali" {...register("location")} />
              {errors.location && <p className="text-status-danger-fg text-xs">{errors.location.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate && <p className="text-status-danger-fg text-xs">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate">Tanggal Selesai (Opsional)</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
              {errors.endDate && <p className="text-status-danger-fg text-xs">{errors.endDate.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">Status Project</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val: string | null) => field.onChange(val === "BERJALAN" ? "BERJALAN" : "PERSIAPAN")}
                  >
                    <SelectTrigger id="status" className="h-9">
                      <SelectValue placeholder="Pilih Status">{field.value === "BERJALAN" ? "Berjalan" : "Persiapan"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERSIAPAN">Persiapan</SelectItem>
                      <SelectItem value="BERJALAN">Berjalan</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-[11px] text-text-secondary">Status Selesai ditetapkan oleh Owner dari detail project (BR-39).</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="timezone">Zona Waktu (NFR-04)</Label>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(val: string | null) => val && field.onChange(val)}>
                    <SelectTrigger id="timezone" className="h-9 text-xs">
                      <SelectValue placeholder="Pilih Zona Waktu">
                        {TIMEZONE_OPTIONS.find((t) => t.value === field.value)?.label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONE_OPTIONS.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <Controller
            name="routineHolidays"
            control={control}
            render={({ field }) => (
              <RoutineHolidaysField value={field.value ?? [0]} onChange={field.onChange} />
            )}
          />

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Buat Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
