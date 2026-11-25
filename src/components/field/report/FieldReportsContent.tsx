"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ServerPagination } from "@/components/ui/ServerPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyReportHistoryQuery, useReportDetailQuery } from "@/hooks/report.hooks";
import { useMyAreasStatusQuery } from "@/hooks/report-lock.hooks";
import { consumeRecentSupervisorSubmission } from "@/lib/session/supervisor-report-session";
import { useAuthStore } from "@/stores/auth.store";
import type { SupervisorAreaTaskStatus } from "@/types/api/report-lock.types";
import { FieldReportCard } from "./FieldReportCard";
import { ReportListEmptyState, ReportObligationCard } from "./ReportObligationCard";

function flattenPendingDates(areas: SupervisorAreaTaskStatus[]) {
  return areas.flatMap((task) => task.pendingDates.map((date, dateIndex) => ({
    task, date, dateIndex, totalDates: task.pendingDates.length,
    isUnlocked: date === task.nextRequiredDate,
  }))).sort((a, b) => a.date.localeCompare(b.date) || a.task.projectName.localeCompare(b.task.projectName));
}
function NewSubmissionNotice({ reportId }: { reportId: string }) {
  const reportQuery = useReportDetailQuery(reportId, "field");
  if (reportQuery.isLoading) return <Skeleton className="h-24 w-full rounded-2xl" />;
  if (!reportQuery.data) return null;

  const report = reportQuery.data;
  return (
      <section role="status" aria-live="polite" className="rounded-2xl border border-status-success-fg/30 bg-status-success-bg p-4" aria-label="Laporan baru terkirim">
      <p className="text-xs font-bold uppercase tracking-wide text-status-success-fg">Baru terkirim</p>
      <p className="mt-1 font-semibold text-text-primary">{report.project.name} · {report.area.name}</p>
      <p className="mt-0.5 text-sm text-text-secondary">Laporan tanggal {report.reportDate} berhasil tersimpan.</p>
      <Link href={`/field/reports/${report.id}`} className="mt-2 inline-flex min-h-12 items-center font-semibold text-status-success-fg">
        Lihat laporan
      </Link>
    </section>
  );
}

export function FieldReportsContent() {
  const role = useAuthStore((state) => state.user?.role);
  const isSiteManager = role === "SITE_MANAGER";
  const [activeTab, setActiveTab] = useState<"own" | "team">("own");
  const [teamPage, setTeamPage] = useState(1);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const areasQuery = useMyAreasStatusQuery();
  const teamReportsQuery = useMyReportHistoryQuery(
    {
      scope: "team",
      page: teamPage,
      pageSize: 10,
      sortBy: "submittedAt",
      sortOrder: "desc",
    },
    isSiteManager && activeTab === "team",
  );
  const tasks = areasQuery.data ?? [];
  const obligations = flattenPendingDates(tasks);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSubmittedId(consumeRecentSupervisorSubmission());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const isRefreshing = activeTab === "team" ? teamReportsQuery.isFetching : areasQuery.isFetching;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Laporan"
        description={
          isSiteManager
            ? "Isi kewajiban laporan area Anda dan pantau laporan masuk dari para Supervisor di project Anda."
            : "Buat laporan untuk kewajiban area Anda, mulai dari tanggal terlama."
        }
        action={<Button type="button" variant="outline" onClick={() => void (activeTab === "team" ? teamReportsQuery.refetch() : areasQuery.refetch())} disabled={isRefreshing} className="min-h-12 px-4" aria-label="Segarkan daftar laporan">
          <RefreshCw className={`mr-2 size-4 ${isRefreshing ? "animate-spin" : ""}`} />Segarkan
        </Button>}
      />

      {isSiteManager && (
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val === "team" ? "team" : "own")}>
          <TabsList className="grid w-full grid-cols-2 bg-surface-input">
            <TabsTrigger value="own" className="min-h-12 text-sm font-semibold">Tugas Saya</TabsTrigger>
            <TabsTrigger value="team" className="min-h-12 text-sm font-semibold">Laporan Tim</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {submittedId && activeTab === "own" && <NewSubmissionNotice reportId={submittedId} />}

      {activeTab === "team" && isSiteManager ? (
        <AsyncStateView
          isLoading={teamReportsQuery.isLoading}
          isError={teamReportsQuery.isError}
          error={teamReportsQuery.error}
          data={teamReportsQuery.data}
          isEmpty={(res) => res.data.length === 0}
          onRetry={() => void teamReportsQuery.refetch()}
          loadingFallback={<div className="space-y-3" aria-busy="true" aria-label="Memuat laporan tim"><Skeleton className="h-32 w-full rounded-2xl" /><Skeleton className="h-32 w-full rounded-2xl" /></div>}
          emptyTitle="Belum ada laporan masuk dari tim"
          emptyDescription="Laporan harian yang dikirim Supervisor pada project yang Anda pimpin akan muncul otomatis di sini."
        >
          {(res) => (
            <div className="space-y-4">
              {res.data.map((report) => <FieldReportCard key={report.id} report={report} />)}
              <ServerPagination meta={res.meta} onPageChange={setTeamPage} />
            </div>
          )}
        </AsyncStateView>
      ) : (
        <AsyncStateView
          isLoading={areasQuery.isLoading}
          isError={areasQuery.isError}
          error={areasQuery.error}
          data={areasQuery.data}
          isEmpty={(items) => items.length === 0}
          onRetry={() => void areasQuery.refetch()}
          loadingFallback={<div className="space-y-3" aria-busy="true" aria-label="Memuat kewajiban laporan"><Skeleton className="h-36 w-full rounded-2xl" /><Skeleton className="h-36 w-full rounded-2xl" /></div>}
          emptyTitle="Belum ada area yang ditugaskan"
          emptyDescription={
            isSiteManager
              ? "Anda belum memiliki area pelaporan pribadi. Buka tab Laporan Tim untuk memantau laporan Supervisor."
              : "Hubungi Owner atau Admin untuk penempatan area Anda."
          }
        >
          {(areas) => obligations.length === 0
            ? <ReportListEmptyState areas={areas} />
            : <div className="space-y-3">{obligations.map((obligation) => <ReportObligationCard key={`${obligation.task.areaId}:${obligation.date}`} {...obligation} />)}</div>}
        </AsyncStateView>
      )}
    </div>
  );
}
