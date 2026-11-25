"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIMEZONE_OPTIONS, type ProjectFormValues } from "@/lib/validation/project.validation";
import type { ActiveProjectStatus } from "@/types/api/project.types";
import { RoutineHolidaysField } from "./RoutineHolidaysField";

const STATUS_OPTIONS: readonly { value: ActiveProjectStatus; label: string }[] = [
  { value: "BERJALAN", label: "Berjalan" },
  { value: "PERSIAPAN", label: "Persiapan" },
];

interface ProjectScheduleSectionProps {
  register: UseFormRegister<ProjectFormValues>;
  control: Control<ProjectFormValues>;
  errors: FieldErrors<ProjectFormValues>;
}

export function ProjectScheduleSection({ register, control, errors }: ProjectScheduleSectionProps) {
  return (
    <div className="space-y-3 border-t border-border pt-3.5">
      <p className="text-[11px] font-semibold tracking-wider text-text-muted uppercase">
        Jadwal &amp; Operasional
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="startDate" className="text-xs font-medium">Tanggal Mulai</Label>
          <Input id="startDate" type="date" className="h-9 text-xs tabular-nums" {...register("startDate")} />
          {errors.startDate && <p className="text-xs text-status-danger-fg">{errors.startDate.message}</p>}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="endDate" className="text-xs font-medium">Target Selesai</Label>
            <span className="text-[11px] text-text-muted">Opsional</span>
          </div>
          <Input id="endDate" type="date" className="h-9 text-xs tabular-nums" {...register("endDate")} />
          {errors.endDate && <p className="text-xs text-status-danger-fg">{errors.endDate.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium">Status Proyek</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <SegmentedControl
                ariaLabel="Status proyek"
                fullWidth
                options={STATUS_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="timezone" className="text-xs font-medium">Zona Waktu</Label>
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
    </div>
  );
}
