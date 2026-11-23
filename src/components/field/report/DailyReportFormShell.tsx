"use client";

import { useSearchParams } from "next/navigation";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { ErrorState } from "@/components/ui/ErrorState";
import { useMyAreasStatusQuery } from "@/hooks/report-lock.hooks";
import { DailyReportEditor } from "./DailyReportEditor";

export function DailyReportFormShell() {
  const searchParams = useSearchParams();
  const areaId = searchParams.get("areaId") ?? "";
  const reportDate = searchParams.get("date") ?? "";
  const areasQuery = useMyAreasStatusQuery();

  if (!areaId || !reportDate) {
    return (
      <ErrorState
        title="Parameter laporan tidak lengkap"
        description="Pilih area dan tanggal langsung dari halaman Laporan."
      />
    );
  }

  return (
    <AsyncStateView
      isLoading={areasQuery.isLoading}
      isError={areasQuery.isError}
      error={areasQuery.error}
      data={areasQuery.data}
      onRetry={() => void areasQuery.refetch()}
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
        if (areaTask.nextRequiredDate !== reportDate) {
          return (
            <ErrorState
              title="Tanggal laporan belum dapat dibuat"
              description="Selesaikan kewajiban tanggal sebelumnya terlebih dahulu. Pilih laporan dari daftar kewajiban yang tersedia."
            />
          );
        }
        return (
          <DailyReportEditor
            key={`${areaId}:${reportDate}`}
            areaTask={areaTask}
            reportDate={reportDate}
          />
        );
      }}
    </AsyncStateView>
  );
}
