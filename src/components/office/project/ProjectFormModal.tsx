"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsersQuery } from "@/hooks/user.hooks";
import { projectFormSchema, type ProjectFormValues } from "@/lib/validation/project.validation";
import type { CreateProjectPayload, ProjectListItem, UpdateProjectPayload } from "@/types/api/project.types";
import { ProjectScheduleSection } from "./ProjectScheduleSection";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit: ProjectListItem | null;
  onSubmitCreate: (data: CreateProjectPayload) => void;
  onSubmitUpdate: (id: string, data: UpdateProjectPayload) => void;
  isSubmitting: boolean;
}

const DEFAULT_VALUES: ProjectFormValues = {
  code: "", name: "", location: "", clientName: "",
  startDate: new Date().toISOString().slice(0, 10), endDate: "",
  status: "PERSIAPAN", timezone: "Asia/Jakarta", routineHolidays: [0], siteManagerId: "",
};

export function ProjectFormModal({
  isOpen, onClose, projectToEdit, onSubmitCreate, onSubmitUpdate, isSubmitting,
}: ProjectFormModalProps) {
  const isEditing = Boolean(projectToEdit);
  const { data: siteManagersData, isLoading: isLoadingSiteManagers } = useUsersQuery(
    { role: "SITE_MANAGER", isActive: true, pageSize: 100 },
    { enabled: isOpen },
  );
  const siteManagers = siteManagersData?.data ?? [];
  const { register, handleSubmit, reset, control, formState: { errors } } =
    useForm<ProjectFormValues>({ resolver: zodResolver(projectFormSchema), defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (projectToEdit) {
      reset({
        code: projectToEdit.code, name: projectToEdit.name, location: projectToEdit.location,
        clientName: projectToEdit.clientName, startDate: projectToEdit.startDate?.slice(0, 10) ?? "",
        endDate: projectToEdit.endDate?.slice(0, 10) ?? "",
        status: projectToEdit.status === "BERJALAN" ? "BERJALAN" : "PERSIAPAN",
        timezone: projectToEdit.timezone, routineHolidays: projectToEdit.routineHolidays ?? [0],
        siteManagerId: projectToEdit.siteManagerId ?? "",
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [projectToEdit, reset, isOpen]);

  const onFormSubmit = (data: ProjectFormValues) => {
    const payload = {
      ...data,
      endDate: data.endDate?.trim() ? data.endDate : null,
      siteManagerId: data.siteManagerId?.trim() ? data.siteManagerId : null,
    };
    if (isEditing && projectToEdit) onSubmitUpdate(projectToEdit.id, payload);
    else onSubmitCreate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Ubah Data Project" : "Tambah Project Baru"}</DialogTitle>
          <DialogDescription className="text-xs">
            Atur identitas proyek, penanggung jawab, jadwal pelaksanaan, zona waktu, dan hari libur rutin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold tracking-wider text-text-muted uppercase">
              Identitas &amp; Penanggung Jawab
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="code" className="text-xs font-medium">Kode Project</Label>
                <Input id="code" placeholder="PRJ-01" className="h-9 text-xs uppercase" {...register("code")} />
                {errors.code && <p className="text-xs text-status-danger-fg">{errors.code.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-medium">Nama Project</Label>
                <Input id="name" placeholder="Villa Ubud Bali" className="h-9 text-xs" {...register("name")} />
                {errors.name && <p className="text-xs text-status-danger-fg">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="clientName" className="text-xs font-medium">Nama Klien</Label>
                <Input id="clientName" placeholder="PT Graha Indah" className="h-9 text-xs" {...register("clientName")} />
                {errors.clientName && <p className="text-xs text-status-danger-fg">{errors.clientName.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="location" className="text-xs font-medium">Lokasi Proyek</Label>
                <Input id="location" placeholder="Ubud, Gianyar, Bali" className="h-9 text-xs" {...register("location")} />
                {errors.location && <p className="text-xs text-status-danger-fg">{errors.location.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="siteManagerId" className="text-xs font-medium">Site Manager</Label>
                <span className="text-[11px] text-text-muted">Opsional</span>
              </div>
              <Controller
                name="siteManagerId"
                control={control}
                render={({ field }) => {
                  const selected = siteManagers.find((sm) => sm.id === field.value);
                  const fallback =
                    field.value && projectToEdit?.siteManager?.id === field.value
                      ? projectToEdit.siteManager.name : undefined;
                  return (
                    <Select
                      value={field.value || "NONE"}
                      disabled={isLoadingSiteManagers}
                      onValueChange={(val: string | null) => field.onChange(!val || val === "NONE" ? "" : val)}
                    >
                      <SelectTrigger id="siteManagerId" className="h-9 text-xs">
                        <SelectValue placeholder="Belum ditetapkan">
                          {selected ? `${selected.name} (@${selected.username})` : (fallback ?? "Belum ditetapkan")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">Belum ditetapkan</SelectItem>
                        {siteManagers.map((sm) => (
                          <SelectItem key={sm.id} value={sm.id}>{sm.name} (@{sm.username})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
            </div>
          </div>

          <ProjectScheduleSection register={register} control={control} errors={errors} />

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-9">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-9">
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Buat Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
