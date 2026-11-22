"use client";

import { RefreshCw } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAreasStatusQuery } from "@/hooks/report-lock.hooks";
import { AreaTaskCard } from "./AreaTaskCard";
import { CompactAreaRow } from "./CompactAreaRow";
import type { SupervisorAreaTaskStatus } from "@/types/api/report-lock.types";

function priorityScore(task: SupervisorAreaTaskStatus): number {
  if (task.isTodayLocked) return 0;
  if (task.nextRequiredDate && !task.isTodaySubmitted && !task.isTodayRestDay) return 1;
  return 2;
}

function FieldTasksSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Memuat daftar tugas area">
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-36 w-full rounded-xl" />
    </div>
  );
}

export function FieldTaskListContent() {
  const areasQuery = useMyAreasStatusQuery();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tugas Lapor"
        description="Selesaikan laporan yang paling mendesak terlebih dahulu."
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => areasQuery.refetch()}
            disabled={areasQuery.isFetching}
            className="min-h-12 px-4 text-base"
            aria-label="Muat ulang daftar tugas"
          >
            <RefreshCw
              className={`mr-2 size-4 ${areasQuery.isFetching ? "animate-spin" : ""}`}
            />
            Segarkan
          </Button>
        }
      />

      <AsyncStateView
        isLoading={areasQuery.isLoading}
        isError={areasQuery.isError}
        error={
          areasQuery.isError
            ? new Error("Gagal memuat daftar tugas. Periksa sinyal HP Anda lalu coba lagi.")
            : undefined
        }
        data={areasQuery.data}
        isEmpty={(items) => items.length === 0}
        onRetry={() => areasQuery.refetch()}
        loadingFallback={<FieldTasksSkeleton />}
        emptyTitle="Belum ada area yang ditugaskan"
        emptyDescription="Hubungi Owner atau Admin untuk penempatan area Anda."
      >
        {(areas) => (
          <div className="space-y-6">
            {(() => {
              const sorted = [...areas].sort((a, b) =>
                priorityScore(a) - priorityScore(b) ||
                (a.oldestOverdueDate ?? a.nextRequiredDate ?? a.todayDate).localeCompare(
                  b.oldestOverdueDate ?? b.nextRequiredDate ?? b.todayDate
                )
              );
              return <>
                <section className="space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary">Prioritas sekarang</h2>
                  <AreaTaskCard task={sorted[0]} />
                </section>
                {sorted.length > 1 && <section className="space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary">Area lainnya</h2>
                  {sorted.slice(1).map((area) => <CompactAreaRow key={area.areaId} task={area} />)}
                </section>}
              </>;
            })()}
          </div>
        )}
      </AsyncStateView>
    </div>
  );
}
