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

function ReportCard({ report }: { report: DailyReportListItem }) {
  return (
    <Link
      href={`/field/reports/${report.id}`}
      className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--project-action) focus-visible:ring-offset-2"
    >
      <Card
        size="sm"
        className="h-full gap-1 rounded-xl border border-(--project-border) bg-(--project-surface) py-0 text-left shadow-none ring-0 transition-colors hover:border-(--project-action) hover:bg-(--project-canvas)"
      >
        <CardContent className="flex min-h-13 flex-col justify-center gap-1 p-3">
          <span className="text-xs leading-4 text-(--project-text-secondary)">
            {formatReportDate(report.reportDate)}
          </span>
          <span className="line-clamp-2 text-sm font-semibold leading-5 text-(--project-text-heading)">
            Area {report.area.name}
          </span>
        </CardContent>
      </Card>
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
    <div className="flex flex-col gap-2">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}

export function SupervisorHomeReportList({ reports, loading, failed, retry }: ReportListProps) {
  return (
    <section aria-labelledby="home-recent-title" className="space-y-3">
      <div className="flex min-h-10 items-center justify-between gap-1">
        <h2 id="home-recent-title" className="text-xl font-bold text-(--project-text-heading)">
          Laporan Terakhir
        </h2>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/field/history" />}
          className="min-h-10 shrink-0 px-2 text-xs font-semibold text-(--project-action) hover:bg-(--project-action)/10 sm:text-sm"
        >
          Lihat semua riwayat <ChevronRight className="size-4" />
        </Button>
      </div>
      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Memuat laporan terbaru">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : failed ? (
        <Card className="gap-0 rounded-[1.125rem] border border-(--project-border) bg-(--project-surface) py-0">
          <CardContent className="p-5">
            <p className="text-base text-(--project-text-secondary)">Laporan terbaru belum dapat dimuat.</p>
            <Button type="button" variant="outline" onClick={retry} className="mt-3 min-h-12">Coba lagi</Button>
          </CardContent>
        </Card>
      ) : reports?.length ? (
        <ReportRows reports={reports} />
      ) : (
        <Card className="gap-0 rounded-[1.125rem] border border-dashed border-(--project-border) bg-(--project-surface) py-0 shadow-none">
          <CardContent className="p-5 text-base text-(--project-text-secondary)">
            Belum ada laporan terkirim. Laporan yang berhasil dikirim akan muncul di sini.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
