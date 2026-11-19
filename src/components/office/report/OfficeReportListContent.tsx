"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { buttonVariants } from "@/components/ui/button";
import { ArchivedReportList } from "./ArchivedReportList";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useOfficeReportsQuery } from "@/hooks/report.hooks";
import type { ListReportsQuery } from "@/types/api/report.types";
import { OfficeReportFilters } from "./OfficeReportFilters";
import { OfficeReportTable } from "./OfficeReportTable";
import { ReportPdfExportControl } from "./ReportPdfExportControl";

const INITIAL_FILTERS: ListReportsQuery = { page: 1, pageSize: 10 };

export function OfficeReportListContent({ view = "reports" }: { view?: "reports" | "archive" }) {
  const role = useAuthStore((state) => state.user?.role);
  const canArchive = role === "OWNER" || role === "ADMIN";
  const showArchive = canArchive && view === "archive";
  const [filters, setFilters] = useState<ListReportsQuery>(INITIAL_FILTERS);
  const reportsQuery = useOfficeReportsQuery(filters, !showArchive);

  function handleFilterPatch(patch: Partial<ListReportsQuery>) {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Harian"
        description="Daftar laporan harian lapangan seluruh project beserta detail foto dan riwayat revisi."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
      {canArchive && <nav aria-label="Tampilan laporan" className="flex gap-2">
        <Link href="/reports" aria-current={!showArchive ? "page" : undefined}
          className={buttonVariants({ variant: !showArchive ? "default" : "outline" })}>Laporan</Link>
        <Link href="/reports?view=archive" aria-current={showArchive ? "page" : undefined}
          className={buttonVariants({ variant: showArchive ? "default" : "outline" })}>Arsip Harian</Link>
      </nav>}
      {canArchive && <ReportPdfExportControl />}
      </div>
      {showArchive ? <ArchivedReportList /> : <Card>
        <CardContent className="space-y-4 pt-6">
          <OfficeReportFilters
            filters={filters}
            onChange={handleFilterPatch}
            onReset={() => setFilters(INITIAL_FILTERS)}
          />

          <AsyncStateView
            isLoading={reportsQuery.isLoading}
            isError={reportsQuery.isError}
            error={reportsQuery.error}
            data={reportsQuery.data}
            isEmpty={(res) => res.data.length === 0}
            onRetry={() => reportsQuery.refetch()}
            emptyTitle="Belum ada laporan sesuai filter"
            emptyDescription="Coba ubah rentang tanggal atau kriteria pencarian laporan."
          >
            {(res) => (
              <OfficeReportTable
                data={res.data}
                meta={res.meta}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              />
            )}
          </AsyncStateView>
        </CardContent>
      </Card>}
    </div>
  );
}
