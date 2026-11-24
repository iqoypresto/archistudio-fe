"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useReportDetailQuery } from "@/hooks/report.hooks";
import { useMyAreasStatusQuery } from "@/hooks/report-lock.hooks";
import { consumeRecentSupervisorSubmission } from "@/lib/session/supervisor-report-session";
import type { SupervisorAreaTaskStatus } from "@/types/api/report-lock.types";
import { ReportListEmptyState, ReportObligationCard } from "./ReportObligationCard";

function flattenPendingDates(areas: SupervisorAreaTaskStatus[]) {
  return areas.flatMap((task) => task.pendingDates.map((date, dateIndex) => ({
    task, date, dateIndex, totalDates: task.pendingDates.length,
    isUnlocked: date === task.nextRequiredDate,
  }))).sort((a, b) => a.date.localeCompare(b.date) || a.task.projectName.localeCompare(b.task.projectName));
}
function NewSubmissionNotice({ reportId }: { reportId: string }) {
  const reportQuery = useReportDetailQuery(reportId);
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
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const areasQuery = useMyAreasStatusQuery();
  const tasks = areasQuery.data ?? [];
  const obligations = flattenPendingDates(tasks);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSubmittedId(consumeRecentSupervisorSubmission());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Laporan"
        description="Buat laporan untuk kewajiban area Anda, mulai dari tanggal terlama."
        action={<Button type="button" variant="outline" onClick={() => void areasQuery.refetch()} disabled={areasQuery.isFetching} className="min-h-12 px-4" aria-label="Segarkan daftar laporan">
          <RefreshCw className={`mr-2 size-4 ${areasQuery.isFetching ? "animate-spin" : ""}`} />Segarkan
        </Button>}
      />

      {submittedId && <NewSubmissionNotice reportId={submittedId} />}

      <AsyncStateView
        isLoading={areasQuery.isLoading}
        isError={areasQuery.isError}
        error={areasQuery.error}
        data={areasQuery.data}
        isEmpty={(items) => items.length === 0}
        onRetry={() => void areasQuery.refetch()}
        loadingFallback={<div className="space-y-3" aria-busy="true" aria-label="Memuat kewajiban laporan"><Skeleton className="h-36 w-full rounded-2xl" /><Skeleton className="h-36 w-full rounded-2xl" /></div>}
        emptyTitle="Belum ada area yang ditugaskan"
        emptyDescription="Hubungi Owner atau Admin untuk penempatan area Anda."
      >
        {(areas) => obligations.length === 0
          ? <ReportListEmptyState areas={areas} />
          : <div className="space-y-3">{obligations.map((obligation) => <ReportObligationCard key={`${obligation.task.areaId}:${obligation.date}`} {...obligation} />)}</div>}
      </AsyncStateView>
    </div>
  );
}
