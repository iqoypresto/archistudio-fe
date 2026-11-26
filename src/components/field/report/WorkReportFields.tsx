import { Cloud, CloudRain, Sun } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ReportFormValues } from "@/lib/validation/report.validation";
import { cn } from "@/lib/utils";
import type { WeatherType } from "@/types/api/report.types";

const WEATHER_OPTIONS: Array<{
  value: WeatherType;
  label: string;
  icon: typeof Sun;
}> = [
  { value: "CERAH", label: "Cerah", icon: Sun },
  { value: "BERAWAN", label: "Berawan", icon: Cloud },
  { value: "HUJAN", label: "Hujan", icon: CloudRain },
];

export function WorkReportFields({
  form,
  disabled,
}: {
  form: UseFormReturn<ReportFormValues>;
  disabled?: boolean;
}) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = form;
  const selectedWeather = useWatch({ control, name: "weather" });
  const progressText = useWatch({ control, name: "progressText" }) ?? "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <fieldset className="grid grid-cols-3 gap-2.5" aria-label="Kondisi cuaca">
          <legend className="col-span-3 mb-2 text-base font-semibold text-text-primary">Cuaca Lapangan</legend>
          {WEATHER_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = selectedWeather === opt.value;
            return <label key={opt.value} className={cn(
                  "flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5 text-sm font-semibold transition-colors",
                  active ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface-input text-text-secondary hover:bg-surface-active/60", disabled && "cursor-not-allowed opacity-60") }>
                <input type="radio" name="weather" value={opt.value} checked={active} disabled={disabled} onChange={() => setValue("weather", opt.value, { shouldValidate: true })} className="sr-only" />
                <Icon className="size-5" />
                <span>{opt.label}</span>
              </label>;
          })}
        </fieldset>
        {errors.weather && (
          <p className="text-sm font-medium text-status-danger-fg">
            {errors.weather.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="workerCount" className="text-base font-semibold text-text-primary">
          Jumlah Pekerja Hadir
        </Label>
        <Input
          id="workerCount"
          type="number"
          inputMode="numeric"
          min={0}
          disabled={disabled}
          className="min-h-12 font-mono text-base tabular-nums"
          {...register("workerCount", { valueAsNumber: true })}
        />
        {errors.workerCount && (
          <p className="text-sm font-medium text-status-danger-fg">
            {errors.workerCount.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="progressText" className="text-base font-semibold text-text-primary">
          Uraian pekerjaan hari ini
        </Label>
        <Textarea
          id="progressText"
          rows={3}
          maxLength={500}
          disabled={disabled}
          placeholder="Contoh: Pengecoran sloof zona barat selesai 80%"
          className="w-full rounded-xl border-border bg-surface-input p-3 text-base text-text-primary focus-visible:ring-ring"
          {...register("progressText")}
        />
        <p className="text-right text-xs tabular-nums text-text-secondary">{progressText.length}/500</p>
        {errors.progressText && (
          <p className="text-sm font-medium text-status-danger-fg">
            {errors.progressText.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="obstaclesText" className="text-base font-semibold text-text-primary">
          Hambatan / Kendala
        </Label>
        <Textarea
          id="obstaclesText"
          rows={2}
          disabled={disabled}
          placeholder="Tulis kendala atau 'Tidak ada'"
          className="w-full rounded-xl border-border bg-surface-input p-3 text-base text-text-primary focus-visible:ring-ring"
          {...register("obstaclesText")}
        />
        {errors.obstaclesText && (
          <p className="text-sm font-medium text-status-danger-fg">
            {errors.obstaclesText.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tomorrowPlanText" className="text-base font-semibold text-text-primary">
          Rencana Pekerjaan Besok
        </Label>
        <Textarea
          id="tomorrowPlanText"
          rows={2}
          disabled={disabled}
          placeholder="Contoh: Lanjut pemasangan bekisting kolom lantai 1"
          className="w-full rounded-xl border-border bg-surface-input p-3 text-base text-text-primary focus-visible:ring-ring"
          {...register("tomorrowPlanText")}
        />
        {errors.tomorrowPlanText && (
          <p className="text-sm font-medium text-status-danger-fg">
            {errors.tomorrowPlanText.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="locationText" className="text-base font-semibold text-text-primary">
          Catatan Lokasi (Opsional)
        </Label>
        <Input
          id="locationText"
          type="text"
          disabled={disabled}
          placeholder="Contoh: Area Struktur Barat"
          className="min-h-12 text-base"
          {...register("locationText")}
        />
      </div>
    </div>
  );
}
