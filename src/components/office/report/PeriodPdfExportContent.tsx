"use client";

import { useState, type FormEvent } from "react";
import { Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageInfoDialog } from "@/components/ui/PageInfoDialog";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { pdfExportApi } from "@/lib/api/pdf-export.api";
import { MonthYearSelect } from "./MonthYearSelect";
import { PeriodPdfSummaryCard } from "./PeriodPdfSummaryCard";
import { PeriodDailyPreviewPanel, PeriodMonthlyPreviewPanel } from "./PeriodReportPreviewPanel";

type ExportMode = "monthly" | "daily";

function getTodayInTimeZone(timeZone = "Asia/Jakarta"): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function inclusiveDays(from: string, to: string): number {
  return Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) + 1;
}

function shiftDate(iso: string, deltaDays: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return date.toISOString().slice(0, 10);
}

function getMonthPreset(offsetMonths: number, timeZone = "Asia/Jakarta"): string {
  const today = new Date(`${getTodayInTimeZone(timeZone)}T00:00:00Z`);
  today.setUTCDate(1);
  today.setUTCMonth(today.getUTCMonth() + offsetMonths);
  return today.toISOString().slice(0, 7);
}

export function PeriodPdfExportContent({ projectId, mode }: { projectId: string; mode: ExportMode }) {
  const project = useProjectDetailQuery(projectId).data;
  const projectTimeZone = project?.timezone ?? "Asia/Jakarta";
  const [month, setMonth] = useState(() => getMonthPreset(0));
  const [fromDate, setFromDate] = useState(() => shiftDate(getTodayInTimeZone(), -6));
  const [toDate, setToDate] = useState(() => getTodayInTimeZone());
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const rangeDays = fromDate && toDate ? inclusiveDays(fromDate, toDate) : 0;
  const validRange = rangeDays > 0 && rangeDays <= 7;
  const isMonthly = mode === "monthly";

  const applyDailyPreset = (preset: "last7" | "thisWeek" | "lastWeek") => {
    const today = getTodayInTimeZone(projectTimeZone);
    const dayOfWeek = new Date(`${today}T00:00:00Z`).getUTCDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    if (preset === "last7") {
      setFromDate(shiftDate(today, -6));
      setToDate(today);
    } else if (preset === "thisWeek") {
      setFromDate(shiftDate(today, -daysSinceMonday));
      setToDate(today);
    } else {
      const lastMonday = shiftDate(today, -daysSinceMonday - 7);
      setFromDate(lastMonday);
      setToDate(shiftDate(lastMonday, 6));
    }
    setCompleted(false);
    setError(null);
  };

  async function download(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCompleted(false);
    setIsPending(true);
    try {
      if (isMonthly) await pdfExportApi.downloadMonthlyReportPdf({ projectId, month });
      else await pdfExportApi.downloadDailyReportRangePdf({ projectId, fromDate, toDate });
      setCompleted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-5 tabular-nums">
      <PageHeader
        kicker={project ? `${project.code} · ${project.name}` : undefined}
        title={isMonthly ? "Laporan Bulanan" : "Laporan Harian Rentang Tanggal"}
        titleSuffix={
          <PageInfoDialog
            title={isMonthly ? "Tentang Laporan Bulanan" : "Tentang Laporan Harian Rentang Tanggal"}
            description={
              isMonthly
                ? "Unduh rekap kepatuhan pelaporan bulanan per area untuk satu bulan kalender."
                : "Unduh kompilasi laporan harian lengkap beserta dokumentasi foto hingga 7 hari kalender."
            }
          />
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <form id="period-pdf-form" onSubmit={download} className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-secondary">Pilih Cepat Periode</p>
            <div className="flex flex-wrap gap-2">
              {isMonthly ? (
                <>
                  <Button type="button" variant="outline" size="sm" className="h-10 text-xs sm:h-8" onClick={() => setMonth(getMonthPreset(0, projectTimeZone))}>Bulan Ini</Button>
                  <Button type="button" variant="outline" size="sm" className="h-10 text-xs sm:h-8" onClick={() => setMonth(getMonthPreset(-1, projectTimeZone))}>Bulan Lalu</Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" size="sm" className="h-10 text-xs sm:h-8" onClick={() => applyDailyPreset("last7")}>7 Hari Terakhir</Button>
                  <Button type="button" variant="outline" size="sm" className="h-10 text-xs sm:h-8" onClick={() => applyDailyPreset("thisWeek")}>Minggu Ini</Button>
                  <Button type="button" variant="outline" size="sm" className="h-10 text-xs sm:h-8" onClick={() => applyDailyPreset("lastWeek")}>Minggu Lalu</Button>
                </>
              )}
            </div>
          </div>

          {isMonthly ? (
            <div className="max-w-sm space-y-1.5">
              <Label className="text-xs font-medium">Bulan &amp; Tahun Kalender</Label>
              <MonthYearSelect value={month} onChange={setMonth} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="from-date" className="text-xs font-medium">Tanggal Awal</Label>
                <Input id="from-date" type="date" required max={toDate || undefined} value={fromDate} className="h-11 sm:h-9 sm:text-xs" onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to-date" className="text-xs font-medium">Tanggal Akhir</Label>
                <Input id="to-date" type="date" required min={fromDate || undefined} value={toDate} className="h-11 sm:h-9 sm:text-xs" onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
          )}

          {!isMonthly && rangeDays > 7 && (
            <p role="alert" className="text-xs text-status-danger-fg">
              Rentang terpilih {rangeDays} hari melebihi batas maksimal 7 hari kalender.
            </p>
          )}
          {!isMonthly && validRange && (
            <div className="rounded-lg border border-border bg-canvas/60 px-3.5 py-2.5 text-xs text-text-secondary">
              Periode terpilih: <strong className="text-text-primary">{rangeDays} hari kalender</strong> (maks. 7 hari).
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button type="submit" disabled={isPending || (isMonthly ? !month : !validRange)} className="h-11 w-full gap-1.5 text-xs sm:h-9 sm:w-auto">
              <Download className="size-3.5" />
              {isPending ? "Menyiapkan PDF..." : isMonthly ? "Unduh PDF Bulanan" : "Unduh PDF Rentang"}
            </Button>
            {completed && (
              <span role="status" className="inline-flex items-center gap-1.5 text-xs text-status-success-fg">
                <Check className="size-3.5" /> PDF berhasil diunduh.
              </span>
            )}
          </div>
        </form>

        <PeriodPdfSummaryCard project={project} isMonthly={isMonthly} />
      </div>

      {error && (
        <ErrorState
          title="PDF tidak dapat dibuat"
          description={error}
          onRetry={() => (document.getElementById("period-pdf-form") as HTMLFormElement | null)?.requestSubmit()}
        />
      )}

      {isMonthly ? (
        <PeriodMonthlyPreviewPanel projectId={projectId} month={month} />
      ) : (
        <PeriodDailyPreviewPanel
          key={`${projectId}:${fromDate}:${toDate}`}
          projectId={projectId}
          fromDate={fromDate}
          toDate={toDate}
          validRange={validRange}
        />
      )}
    </div>
  );
}
