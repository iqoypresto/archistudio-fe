"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { PageHeader } from "@/components/ui/PageHeader";
import { ServerPagination } from "@/components/ui/ServerPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyReportHistoryQuery } from "@/hooks/report.hooks";
import { FieldReportCard } from "./FieldReportCard";

export function FieldHistoryContent() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"ALL" | "DRAFT" | "SUBMITTED">("ALL");
  const historyQuery = useMyReportHistoryQuery({ page, pageSize: 10,
    status: status === "ALL" ? undefined : status });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Riwayat Saya"
        description="Daftar laporan harian yang Anda buat."
      />

      <div role="group" aria-label="Filter status laporan" className="grid grid-cols-3 gap-2">
        {(["ALL", "DRAFT", "SUBMITTED"] as const).map((value) => <Button
          key={value} type="button" variant="outline" aria-pressed={status === value}
          onClick={() => { setStatus(value); setPage(1); }}
          className={`min-h-12 px-2 text-sm ${status === value ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-text-secondary"}`}>
          {value === "ALL" ? "Semua" : value === "DRAFT" ? "Draf" : "Terkirim"}
        </Button>)}
      </div>

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
        emptyDescription="Laporan yang sudah Anda kirim akan muncul di sini."
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
