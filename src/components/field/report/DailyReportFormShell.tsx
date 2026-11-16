"use client";

import { useSearchParams } from "next/navigation";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { ErrorState } from "@/components/ui/ErrorState";
import { useMyAreasStatusQuery } from "@/hooks/report-lock.hooks";
import { useReportDetailQuery } from "@/hooks/report.hooks";
import { DailyReportEditor } from "./DailyReportEditor";

export function DailyReportFormShell() {
  const searchParams = useSearchParams();
  const areaId = searchParams.get("areaId") ?? "";
  const reportDate = searchParams.get("date") ?? "";
  const draftId = searchParams.get("draftId");

  const areasQuery = useMyAreasStatusQuery();
  const draftQuery = useReportDetailQuery(draftId);

  if (!areaId || !reportDate) {
    return (
      <ErrorState
        title="Parameter laporan tidak lengkap"
        description="Pilih area dan tanggal langsung dari halaman Tugas Lapor."
      />
    );
  }

  return (
    <AsyncStateView
      isLoading={areasQuery.isLoading || (Boolean(draftId) && draftQuery.isLoading)}
      isError={areasQuery.isError || (Boolean(draftId) && draftQuery.isError)}
      error={areasQuery.error ?? draftQuery.error}
      data={areasQuery.data}
      onRetry={() => {
        void areasQuery.refetch();
        if (draftId) void draftQuery.refetch();
      }}
      emptyTitle="Area tidak ditemukan"
    >
      {(areas) => {
        const areaTask = areas.find((a) => a.areaId === areaId);
        if (!areaTask) {
          return (
            <ErrorState
              title="Area tidak ditugaskan"
              description="Anda tidak memiliki penugasan aktif untuk area tersebut."
            />
          );
        }
        return (
          <DailyReportEditor
            key={`${areaId}:${reportDate}:${draftQuery.data?.id ?? "new"}`}
            areaTask={areaTask}
            reportDate={reportDate}
            draft={draftQuery.data}
          />
        );
      }}
    </AsyncStateView>
  );
}
