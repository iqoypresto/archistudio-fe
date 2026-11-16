"use client";

import { useState } from "react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useOfficeReportsQuery } from "@/hooks/report.hooks";
import type { ListReportsQuery } from "@/types/api/report.types";
import { OfficeReportFilters } from "./OfficeReportFilters";
import { OfficeReportTable } from "./OfficeReportTable";

const INITIAL_FILTERS: ListReportsQuery = { page: 1, pageSize: 10 };

export function OfficeReportListContent() {
  const [filters, setFilters] = useState<ListReportsQuery>(INITIAL_FILTERS);
  const reportsQuery = useOfficeReportsQuery(filters);

  function handleFilterPatch(patch: Partial<ListReportsQuery>) {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Harian"
        description="Daftar laporan harian lapangan seluruh project beserta detail foto dan riwayat revisi."
      />

      <Card>
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
      </Card>
    </div>
  );
}
