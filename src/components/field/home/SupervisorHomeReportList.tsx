import Link from "next/link";
import { CalendarCheck, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { DailyReportListItem } from "@/types/api/report.types";

function dateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatSubmittedAt(report: DailyReportListItem): string {
  const submitted = report.submittedAt
    ? new Date(report.submittedAt)
    : new Date(`${report.reportDate}T12:00:00+07:00`);
  if (Number.isNaN(submitted.getTime())) return report.reportDate;

  if (!report.submittedAt) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta",
    }).format(submitted);
  }

  const daysAgo = Math.round(
    (Date.parse(`${dateKey(new Date())}T00:00:00Z`) - Date.parse(`${dateKey(submitted)}T00:00:00Z`)) / 86_400_000,
  );
  if (daysAgo > 1 && daysAgo < 7) return `${daysAgo} hari lalu`;

  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Jakarta",
  }).format(submitted);
  if (daysAgo === 0) return `Hari ini, ${time}`;
  if (daysAgo === 1) return `Kemarin, ${time}`;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta",
  }).format(submitted);
}

function ReportRow({ report }: { report: DailyReportListItem }) {
  const Icon = report.reportType === "WORK" ? FileText : CalendarCheck;
  const iconClass = report.reportType === "WORK"
    ? "bg-primary-soft text-primary"
    : "bg-status-success-bg text-status-success-fg";

  return (
    <Link
      href={`/field/reports/${report.id}`}
      className="flex min-h-24 items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}>
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-bold text-text-primary">
          Laporan Proyek {report.project.name}
        </span>
        <span className="mt-1 block truncate text-sm text-text-secondary">
          Area {report.area.name} · Terkirim
        </span>
      </span>
      <span className="max-w-24 shrink-0 text-right text-sm text-text-secondary">
        {formatSubmittedAt(report)}
      </span>
    </Link>
  );
}

type ReportListProps = {
  reports: DailyReportListItem[] | undefined;
  loading: boolean;
  failed: boolean;
  retry: () => void;
};

export function SupervisorHomeReportList({ reports, loading, failed, retry }: ReportListProps) {
  return (
    <section aria-labelledby="home-recent-title" className="mt-8 space-y-3">
      <div className="flex min-h-11 items-center justify-between gap-2">
        <h2 id="home-recent-title" className="text-xl font-bold text-text-primary">Riwayat Terbaru</h2>
        <Link href="/field/history" className="inline-flex min-h-12 shrink-0 items-center gap-1 font-semibold text-primary">
          Lihat Semua <ChevronRight className="size-5" />
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2" aria-busy="true" aria-label="Memuat laporan terbaru">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : failed ? (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-text-secondary">Laporan terbaru belum dapat dimuat.</p>
          <Button type="button" variant="outline" onClick={retry} className="mt-3 min-h-12">Coba lagi</Button>
        </div>
      ) : reports?.length ? (
        <div className="space-y-2">{reports.map((report) => <ReportRow key={report.id} report={report} />)}</div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-5 text-text-secondary">
          Belum ada laporan terkirim. Laporan yang berhasil dikirim akan muncul di sini.
        </div>
      )}
    </section>
  );
}
