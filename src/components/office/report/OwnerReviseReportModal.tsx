"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalContextStrip } from "@/components/ui/ModalContextStrip";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Textarea } from "@/components/ui/textarea";
import { useReviseReportMutation } from "@/hooks/report.hooks";
import { formatIdDate } from "@/lib/utils/office-format";
import { reviseReportSchema, type ReviseReportFormValues } from "@/lib/validation/report-revision.validation";
import type { DailyReportDetail, WeatherType } from "@/types/api/report.types";

const WEATHER_OPTIONS: readonly { value: WeatherType; label: string }[] = [
  { value: "CERAH", label: "Cerah" },
  { value: "BERAWAN", label: "Berawan" },
  { value: "HUJAN", label: "Hujan" },
];

export function OwnerReviseReportModal({
  report, open, onOpenChange,
}: {
  report: DailyReportDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const reviseMutation = useReviseReportMutation();
  const { register, control, setValue, handleSubmit, formState: { errors } } =
    useForm<ReviseReportFormValues>({
      resolver: zodResolver(reviseReportSchema),
      defaultValues: {
        changeSummary: "", progressText: report.progressText ?? "",
        obstaclesText: report.obstaclesText ?? "", tomorrowPlanText: report.tomorrowPlanText ?? "",
        weather: report.weather ?? "CERAH", workerCount: report.workerCount ?? 0,
        noWorkReason: report.noWorkReason ?? "", locationText: report.locationText ?? "",
      },
    });
  const selectedWeather = (useWatch({ control, name: "weather" }) ?? "CERAH") as WeatherType;

  async function onSubmit(values: ReviseReportFormValues): Promise<void> {
    await reviseMutation.mutateAsync({
      reportId: report.id,
      payload: {
        changeSummary: values.changeSummary, reportType: report.reportType,
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
          <DialogTitle>Revisi Laporan Harian</DialogTitle>
          <DialogDescription className="text-xs">
            Versi sebelum diubah tersimpan otomatis pada riwayat revisi.
          </DialogDescription>
        </DialogHeader>

        <ModalContextStrip
          kicker={`${report.reportNumber} · ${formatIdDate(report.reportDate)}`}
          title={`${report.project.name} — ${report.area.code} ${report.area.name}`}
          meta={`Supervisor: ${report.supervisor.name}`}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {report.reportType === "WORK" ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.3fr_0.7fr]">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Cuaca</Label>
                  <SegmentedControl ariaLabel="Pilih cuaca" fullWidth options={WEATHER_OPTIONS} value={selectedWeather} onChange={(val) => setValue("weather", val)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="revWorkerCount" className="text-xs font-medium">Jumlah Pekerja</Label>
                  <Input id="revWorkerCount" type="number" min={0} className="h-9 text-xs tabular-nums" {...register("workerCount", { valueAsNumber: true })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="revProgress" className="text-xs font-medium">Progres Pekerjaan</Label>
                <Textarea id="revProgress" rows={2} className="min-h-16 w-full rounded-lg border-border bg-surface-input p-2.5 text-xs" {...register("progressText")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="revObstacles" className="text-xs font-medium">Hambatan / Kendala</Label>
                <Textarea id="revObstacles" rows={2} className="min-h-16 w-full rounded-lg border-border bg-surface-input p-2.5 text-xs" {...register("obstaclesText")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="revTomorrow" className="text-xs font-medium">Rencana Besok</Label>
                <Textarea id="revTomorrow" rows={2} className="min-h-16 w-full rounded-lg border-border bg-surface-input p-2.5 text-xs" {...register("tomorrowPlanText")} />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="revNoWork" className="text-xs font-medium">Alasan Hari Tanpa Pekerjaan</Label>
              <Textarea id="revNoWork" rows={3} className="min-h-20 w-full rounded-lg border-border bg-surface-input p-2.5 text-xs" {...register("noWorkReason")} />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="revLocation" className="text-xs font-medium">Catatan Lokasi</Label>
              <span className="text-[11px] text-text-muted">Opsional</span>
            </div>
            <Input id="revLocation" className="h-9 text-xs" {...register("locationText")} />
          </div>

          <div className="space-y-1.5 border-t border-border pt-3.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="changeSummary" className="text-xs font-medium">Ringkasan Perubahan</Label>
              <span className="text-[11px] text-text-muted">Wajib</span>
            </div>
            <Input id="changeSummary" placeholder="Contoh: Koreksi jumlah pekerja sesuai absensi lapangan" className="h-9 text-xs" {...register("changeSummary")} />
            {errors.changeSummary && <p className="text-xs text-status-danger-fg">{errors.changeSummary.message}</p>}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9">Batal</Button>
            <Button type="submit" disabled={reviseMutation.isPending} className="h-9 gap-1.5">
              {reviseMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
              Simpan Revisi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
