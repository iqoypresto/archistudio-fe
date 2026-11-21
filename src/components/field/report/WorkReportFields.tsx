import { Cloud, CloudRain, Sun } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-semibold text-text-primary">Cuaca Lapangan</Label>
        <div className="grid grid-cols-3 gap-2.5">
          {WEATHER_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = selectedWeather === opt.value;
            return (
              <Button
                key={opt.value}
                type="button"
                disabled={disabled}
                variant="outline"
                aria-pressed={active}
                onClick={() => setValue("weather", opt.value, { shouldValidate: true })}
                className={cn(
                  "h-auto flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "border-white/25 bg-surface-active text-text-primary shadow-2xs"
                    : "border-border bg-surface-input text-text-secondary hover:bg-surface-active/60"
                )}
              >
                <Icon className="size-5" />
                <span>{opt.label}</span>
              </Button>
            );
          })}
        </div>
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
          Progres Pekerjaan Hari Ini
        </Label>
        <Textarea
          id="progressText"
          rows={3}
          disabled={disabled}
          placeholder="Contoh: Pengecoran sloof zona barat selesai 80%"
          className="w-full rounded-xl border-border bg-surface-input p-3 text-base text-text-primary focus-visible:ring-ring"
          {...register("progressText")}
        />
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
