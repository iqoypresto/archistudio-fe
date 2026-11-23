"use client";

import Link from "next/link";
import { ArrowRight, Building2, ClipboardCheck, Clock3, FileText } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyReportHistoryQuery } from "@/hooks/report.hooks";
import { useMyAreasStatusQuery } from "@/hooks/report-lock.hooks";
import { useAuthStore } from "@/stores/auth.store";
import type { DailyReportListItem } from "@/types/api/report.types";
import type { SupervisorAreaTaskStatus } from "@/types/api/report-lock.types";

function HomeHero({ name }: { name: string }) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-[#161719] px-5 py-6 text-white shadow-sm sm:px-6">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_10%,rgba(255,255,255,0.14),transparent_42%),linear-gradient(135deg,#161719_5%,#263445_100%)]" />
      <div aria-hidden="true" className="absolute -right-8 -top-10 -z-10 size-44 rounded-full border border-white/10" />
      <div aria-hidden="true" className="absolute -right-1 -top-3 -z-10 size-28 rounded-full border border-white/10" />
      <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white/75">
        <Building2 className="size-4" />
        ARCHISTUDIO
      </div>
      <p className="mt-7 text-sm font-medium text-white/70">Ruang kerja lapangan</p>
      <h1 className="mt-1 max-w-[16rem] text-2xl font-bold leading-tight sm:text-3xl">
        Halo, {name}
      </h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/75">
        Pantau kewajiban laporan dan perkembangan area project Anda.
      </p>
      <Link
        href="/field/reports"
        className={buttonVariants({ variant: "secondary" }) + " mt-5 min-h-12 rounded-xl px-4 font-semibold"}
      >
        Buka laporan <ArrowRight className="ml-2 size-4" />
      </Link>
    </section>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta",
  }).format(new Date(`${date}T00:00:00+07:00`));
}

function TaskSummary({ areas, loading, failed, retry }: {
  areas: SupervisorAreaTaskStatus[] | undefined;
  loading: boolean;
  failed: boolean;
  retry: () => void;
}) {
  const pendingCount = areas?.reduce((count, area) => count + area.pendingDates.length, 0) ?? 0;
  const overdueCount = areas?.reduce((count, area) => count + area.overdueBusinessDaysCount, 0) ?? 0;
  const areaCount = areas?.length ?? 0;

  return (
    <section aria-labelledby="home-tasks-title" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Ringkasan</p>
          <h2 id="home-tasks-title" className="mt-1 text-lg font-bold text-text-primary">Tugas hari ini</h2>
        </div>
        <Link href="/field/reports" className="text-sm font-semibold text-primary">Lihat semua</Link>
      </div>
      {loading ? (
        <Skeleton className="h-32 w-full rounded-2xl" />
      ) : failed ? (
        <Card className="rounded-2xl border-border bg-surface p-4">
          <p className="text-sm text-text-secondary">Ringkasan tugas belum dapat dimuat.</p>
          <Button type="button" variant="outline" onClick={retry} className="mt-3 min-h-11">Coba lagi</Button>
        </Card>
      ) : areaCount === 0 ? (
        <Card className="rounded-2xl border-border bg-surface p-4">
          <p className="font-semibold text-text-primary">Belum ada area aktif</p>
          <p className="mt-1 text-sm text-text-secondary">Area yang ditugaskan kepada Anda akan muncul di sini.</p>
        </Card>
      ) : (
        <Card className="rounded-2xl border-border bg-surface py-0">
          <CardContent className="grid grid-cols-2 gap-3 p-4">
            <div className="rounded-xl bg-primary-soft p-3.5">
              <ClipboardCheck className="size-5 text-primary" />
              <p className="mt-3 text-2xl font-bold tabular-nums text-text-primary">{pendingCount}</p>
              <p className="mt-0.5 text-sm text-text-secondary">Laporan menunggu</p>
            </div>
            <div className="rounded-xl bg-status-warning-bg p-3.5">
              <Clock3 className="size-5 text-status-warning-fg" />
              <p className="mt-3 text-2xl font-bold tabular-nums text-text-primary">{overdueCount}</p>
              <p className="mt-0.5 text-sm text-text-secondary">Hari kerja tertunggak</p>
            </div>
            <p className="col-span-2 text-xs text-text-secondary">
              {areaCount} {areaCount === 1 ? "area aktif" : "area aktif"} dalam penugasan Anda.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function RecentReportRow({ report }: { report: DailyReportListItem }) {
  return (
    <Link href={`/field/reports/${report.id}`} className="flex min-h-16 items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:bg-secondary">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <FileText className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text-primary">{report.project.name} · {report.area.name}</span>
        <span className="mt-1 block text-xs text-text-secondary">{formatDate(report.reportDate)} · {report.reportNumber}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-text-secondary" />
    </Link>
  );
}

function RecentReports({ reports, loading, failed, retry }: {
  reports: DailyReportListItem[] | undefined;
  loading: boolean;
  failed: boolean;
  retry: () => void;
}) {
  return (
    <section aria-labelledby="home-recent-title" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Aktivitas</p>
          <h2 id="home-recent-title" className="mt-1 text-lg font-bold text-text-primary">Laporan terbaru</h2>
        </div>
        <Link href="/field/history" className="text-sm font-semibold text-primary">Riwayat</Link>
      </div>
      {loading ? (
        <div className="space-y-2" aria-busy="true" aria-label="Memuat laporan terbaru">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : failed ? (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm text-text-secondary">Laporan terbaru belum dapat dimuat.</p>
          <Button type="button" variant="outline" onClick={retry} className="mt-3 min-h-11">Coba lagi</Button>
        </div>
      ) : reports?.length ? (
        <div className="space-y-2">{reports.map((report) => <RecentReportRow key={report.id} report={report} />)}</div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface p-4 text-sm text-text-secondary">
          Belum ada laporan terkirim. Laporan yang berhasil dikirim akan muncul di sini.
        </div>
      )}
    </section>
  );
}

export function SupervisorHomeContent() {
  const name = useAuthStore((state) => state.user?.name?.split(" ")[0] ?? "Supervisor");
  const areasQuery = useMyAreasStatusQuery();
  const reportsQuery = useMyReportHistoryQuery({
    page: 1, pageSize: 3, status: "SUBMITTED", sortBy: "submittedAt", sortOrder: "desc",
  });

  return (
    <div className="space-y-6">
      <HomeHero name={name} />
      <TaskSummary areas={areasQuery.data} loading={areasQuery.isLoading} failed={areasQuery.isError} retry={() => void areasQuery.refetch()} />
      <RecentReports reports={reportsQuery.data?.data} loading={reportsQuery.isLoading} failed={reportsQuery.isError} retry={() => void reportsQuery.refetch()} />
    </div>
  );
}
