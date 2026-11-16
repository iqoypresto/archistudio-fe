"use client";

import { RefreshCw } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAreasStatusQuery } from "@/hooks/report-lock.hooks";
import { AreaTaskCard } from "./AreaTaskCard";

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
        description="Pilih area untuk mengisi laporan harian Anda."
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
          <div className="space-y-4">
            {areas.map((area) => (
              <AreaTaskCard key={area.areaId} task={area} />
            ))}
          </div>
        )}
      </AsyncStateView>
    </div>
  );
}
