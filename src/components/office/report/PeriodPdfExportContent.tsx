"use client";

import { useState, type FormEvent } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { pdfExportApi } from "@/lib/api/pdf-export.api";

type ExportMode = "monthly" | "daily";

function inclusiveDays(from: string, to: string): number {
  return Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) + 1;
}

export function PeriodPdfExportContent({ projectId, mode }: { projectId: string; mode: ExportMode }) {
  const [month, setMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const rangeDays = fromDate && toDate ? inclusiveDays(fromDate, toDate) : 0;
  const validRange = rangeDays > 0 && rangeDays <= 7;

  async function download(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCompleted(false);
    setIsPending(true);
    try {
      if (mode === "monthly") await pdfExportApi.downloadMonthlyReportPdf({ projectId, month });
      else await pdfExportApi.downloadDailyReportRangePdf({ projectId, fromDate, toDate });
      setCompleted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsPending(false);
    }
  }

  const isMonthly = mode === "monthly";
  const title = isMonthly ? "Laporan Bulanan" : "Laporan Harian Rentang Tanggal";
  const description = isMonthly
    ? "Unduh ringkasan hari wajib lapor, tepat waktu, terlambat, dan belum lapor per area."
    : "Unduh laporan lengkap beserta foto untuk rentang maksimal 7 hari kalender.";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader title={title} description={description} />
      <form id="period-pdf-form" onSubmit={download} className="space-y-5 rounded-xl border border-border bg-surface p-5">
        {isMonthly ? (
          <label className="block max-w-sm space-y-2 text-sm font-medium" htmlFor="report-month">
            Bulan kalender
            <Input id="report-month" type="month" required value={month} onChange={(event) => setMonth(event.target.value)} />
          </label>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium" htmlFor="from-date">
              Tanggal awal
              <Input id="from-date" type="date" required max={toDate || undefined} value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
            </label>
            <label className="space-y-2 text-sm font-medium" htmlFor="to-date">
              Tanggal akhir
              <Input id="to-date" type="date" required min={fromDate || undefined} value={toDate} onChange={(event) => setToDate(event.target.value)} />
            </label>
          </div>
        )}
        {!isMonthly && rangeDays > 7 && <p role="alert" className="text-sm text-destructive">Rentang maksimal adalah 7 hari kalender.</p>}
        {!isMonthly && validRange && <p className="text-sm text-text-secondary">Periode dipilih: {rangeDays} hari kalender. Area tanpa laporan akan ditandai “Belum lapor” di PDF.</p>}
        <Button type="submit" disabled={isPending || (isMonthly ? !month : !validRange)} className="min-h-11">
          <Download className="mr-2 size-4" />{isPending ? "Menyiapkan PDF…" : "Unduh PDF"}
        </Button>
      </form>
      {error && <ErrorState title="PDF tidak dapat dibuat" description={error} onRetry={() => (document.getElementById("period-pdf-form") as HTMLFormElement | null)?.requestSubmit()} />}
      {completed && <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">PDF berhasil dibuat dan diunduh.</p>}
    </div>
  );
}
