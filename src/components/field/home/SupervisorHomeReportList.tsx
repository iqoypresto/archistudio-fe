import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DailyReportListItem } from "@/types/api/report.types";

function formatReportDate(reportDate: string): string {
  const date = new Date(`${reportDate}T12:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return reportDate;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function ReportRow({ report, isLast }: { report: DailyReportListItem; isLast: boolean }) {
  return (
    <Link
      href={`/field/reports/${report.id}`}
      className={`flex min-h-[4.5rem] flex-col justify-center px-2 py-3 focus-visible:outline-2 focus-visible:outline-[var(--project-action)] ${isLast ? "" : "border-b border-[var(--project-border)]"}`}
    >
      <span className="line-clamp-2 text-lg font-bold leading-6 text-[var(--project-text-heading)]">
        Area {report.area.name}
      </span>
      <span className="mt-1 text-base leading-5 text-[var(--project-text-secondary)]">
        {formatReportDate(report.reportDate)}
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

function ReportRows({ reports }: { reports: DailyReportListItem[] }) {
  return (
    <Card className="gap-0 overflow-hidden rounded-[1.125rem] border border-[var(--project-border)] bg-[var(--project-surface)] py-0 shadow-[var(--project-card-shadow)]">
      <CardContent className="px-3 py-0">
        {reports.map((report, index) => (
          <ReportRow key={report.id} report={report} isLast={index === reports.length - 1} />
        ))}
        <Link href="/field/history" className="mx-auto flex min-h-12 w-fit items-center gap-1 px-3 font-semibold text-[var(--project-action)] focus-visible:outline-2 focus-visible:outline-[var(--project-action)]">
          Lihat semua riwayat <ChevronRight className="size-5" />
        </Link>
      </CardContent>
    </Card>
  );
}

export function SupervisorHomeReportList({ reports, loading, failed, retry }: ReportListProps) {
  return (
    <section aria-labelledby="home-recent-title" className="space-y-3">
      <div className="flex min-h-12 items-center justify-between">
        <h2 id="home-recent-title" className="text-xl font-bold text-[var(--project-text-heading)]">Laporan Terakhir</h2>
      </div>
      {loading ? (
        <div className="space-y-2" aria-busy="true" aria-label="Memuat laporan terbaru">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : failed ? (
        <Card className="gap-0 rounded-[1.125rem] border border-[var(--project-border)] bg-[var(--project-surface)] py-0">
          <CardContent className="p-5">
            <p className="text-base text-[var(--project-text-secondary)]">Laporan terbaru belum dapat dimuat.</p>
            <Button type="button" variant="outline" onClick={retry} className="mt-3 min-h-12">Coba lagi</Button>
          </CardContent>
        </Card>
      ) : reports?.length ? (
        <ReportRows reports={reports} />
      ) : (
        <Card className="gap-0 rounded-[1.125rem] border border-dashed border-[var(--project-border)] bg-[var(--project-surface)] py-0 shadow-none">
          <CardContent className="p-5 text-base text-[var(--project-text-secondary)]">
            Belum ada laporan terkirim. Laporan yang berhasil dikirim akan muncul di sini.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
