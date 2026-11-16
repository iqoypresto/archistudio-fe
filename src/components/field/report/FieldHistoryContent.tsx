"use client";

import { useState } from "react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { PageHeader } from "@/components/ui/PageHeader";
import { ServerPagination } from "@/components/ui/ServerPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyReportHistoryQuery } from "@/hooks/report.hooks";
import { FieldReportCard } from "./FieldReportCard";

export function FieldHistoryContent() {
  const [page, setPage] = useState(1);
  const historyQuery = useMyReportHistoryQuery({ page, pageSize: 10 });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Riwayat Saya"
        description="Daftar laporan harian pada area yang Anda pegang."
      />

      <AsyncStateView
        isLoading={historyQuery.isLoading}
        isError={historyQuery.isError}
        error={historyQuery.error}
        data={historyQuery.data}
        isEmpty={(res) => res.data.length === 0}
        onRetry={() => historyQuery.refetch()}
        loadingFallback={
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        }
        emptyTitle="Belum ada riwayat laporan"
        emptyDescription="Laporan yang Anda simpan sebagai draf atau kirim akan muncul di sini."
      >
        {(res) => (
          <div className="space-y-4">
            {res.data.map((report) => (
              <FieldReportCard key={report.id} report={report} />
            ))}
            <ServerPagination meta={res.meta} onPageChange={setPage} />
          </div>
        )}
      </AsyncStateView>
    </div>
  );
}
