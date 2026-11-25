"use client";

import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { useArchivedReportsQuery } from "@/hooks/report.hooks";
import { useArchiveFilters } from "@/hooks/report-archive.hooks";
import { ArchivedReportFilters } from "./ArchivedReportFilters";
import { OfficeReportTable } from "./OfficeReportTable";

export function ArchivedReportList() {
  const { filters, patch, reset, setPage } = useArchiveFilters();
  const reports = useArchivedReportsQuery(filters);

  return (
    <div>
      <div className="p-4 sm:px-5">
        <ArchivedReportFilters filters={filters} onChange={patch} onReset={reset} />
      </div>
      <AsyncStateView
        isLoading={reports.isLoading}
        isError={reports.isError}
        error={reports.error}
        data={reports.data}
        isEmpty={(response) => response.data.length === 0}
        onRetry={() => void reports.refetch()}
        emptyTitle="Belum ada laporan harian dalam arsip."
        emptyDescription="Laporan terkirim masuk arsip setelah tanggal laporan lewat. Coba periksa filter yang dipilih."
      >
        {(response) => (
          <OfficeReportTable
            data={response.data}
            meta={response.meta}
            bare
            showArchivedAt
            onPageChange={setPage}
          />
        )}
      </AsyncStateView>
    </div>
  );
}
