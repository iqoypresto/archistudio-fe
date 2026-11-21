"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
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
import { useReviseReportMutation } from "@/hooks/report.hooks";
import {
  reviseReportSchema,
  type ReviseReportFormValues,
} from "@/lib/validation/report-revision.validation";
import { cn } from "@/lib/utils";
import type { DailyReportDetail, WeatherType } from "@/types/api/report.types";

const WEATHER_VALUES: WeatherType[] = ["CERAH", "BERAWAN", "HUJAN"];

export function OwnerReviseReportModal({
  report,
  open,
  onOpenChange,
}: {
  report: DailyReportDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const reviseMutation = useReviseReportMutation();
  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviseReportFormValues>({
    resolver: zodResolver(reviseReportSchema),
    defaultValues: {
      changeSummary: "",
      progressText: report.progressText ?? "",
      obstaclesText: report.obstaclesText ?? "",
      tomorrowPlanText: report.tomorrowPlanText ?? "",
      weather: report.weather ?? "CERAH",
      workerCount: report.workerCount ?? 0,
      noWorkReason: report.noWorkReason ?? "",
      locationText: report.locationText ?? "",
    },
  });
  const selectedWeather = useWatch({ control, name: "weather" });

  async function onSubmit(values: ReviseReportFormValues): Promise<void> {
    await reviseMutation.mutateAsync({
      reportId: report.id,
      payload: {
        changeSummary: values.changeSummary,
        reportType: report.reportType,
        progressText: report.reportType === "WORK" ? values.progressText : undefined,
        obstaclesText: report.reportType === "WORK" ? values.obstaclesText : undefined,
        tomorrowPlanText: report.reportType === "WORK" ? values.tomorrowPlanText : undefined,
        weather: report.reportType === "WORK" ? values.weather : undefined,
        workerCount: report.reportType === "WORK" ? values.workerCount : undefined,
        noWorkReason: report.reportType === "NO_WORK" ? values.noWorkReason : undefined,
        locationText: values.locationText || null,
      },
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Revisi Laporan (Khusus Owner)</DialogTitle>
          <DialogDescription>
            Versi laporan sebelum diubah akan tersimpan otomatis pada riwayat revisi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="space-y-1">
            <Label htmlFor="changeSummary">Alasan / Ringkasan Perubahan *</Label>
            <Input
              id="changeSummary"
              placeholder="Contoh: Koreksi jumlah pekerja sesuai absensi"
              className="min-h-11"
              {...register("changeSummary")}
            />
            {errors.changeSummary && (
              <p className="text-xs font-medium text-status-danger-fg">
                {errors.changeSummary.message}
              </p>
            )}
          </div>

          {report.reportType === "WORK" ? (
            <>
              <div className="space-y-1">
                <Label>Cuaca</Label>
                <div className="grid grid-cols-3 gap-2">
                  {WEATHER_VALUES.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setValue("weather", w)}
                      className={cn(
                        "h-10 rounded-lg border text-xs font-medium transition-colors",
                        selectedWeather === w
                          ? "border-white/25 bg-surface-active text-text-primary shadow-2xs"
                          : "border-border bg-surface-input text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="revWorkerCount">Jumlah Pekerja</Label>
                <Input
                  id="revWorkerCount"
                  type="number"
                  min={0}
                  className="min-h-11 font-mono tabular-nums"
                  {...register("workerCount", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="revProgress">Progres Pekerjaan</Label>
                <textarea
                  id="revProgress"
                  rows={2}
                  className="w-full rounded-lg border border-border p-2.5 text-sm"
                  {...register("progressText")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="revObstacles">Hambatan</Label>
                <textarea
                  id="revObstacles"
                  rows={2}
                  className="w-full rounded-lg border border-border p-2.5 text-sm"
                  {...register("obstaclesText")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="revTomorrow">Rencana Besok</Label>
                <textarea
                  id="revTomorrow"
                  rows={2}
                  className="w-full rounded-lg border border-border p-2.5 text-sm"
                  {...register("tomorrowPlanText")}
                />
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <Label htmlFor="revNoWork">Alasan Hari Tanpa Pekerjaan</Label>
              <textarea
                id="revNoWork"
                rows={3}
                className="w-full rounded-lg border border-border p-2.5 text-sm"
                {...register("noWorkReason")}
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="revLocation">Lokasi (Opsional)</Label>
            <Input id="revLocation" className="min-h-11" {...register("locationText")} />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="min-h-11">
              Batal
            </Button>
            <Button type="submit" disabled={reviseMutation.isPending} className="min-h-11 bg-primary text-primary-foreground">
              {reviseMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Simpan Revisi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
