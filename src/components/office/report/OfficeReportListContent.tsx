"use client";

import { useState } from "react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageInfoDialog } from "@/components/ui/PageInfoDialog";
import { UnderlineTabsBar } from "@/components/ui/UnderlineTabsNav";
import { useArchivedReportsQuery, useOfficeReportsQuery } from "@/hooks/report.hooks";
import { useAuthStore } from "@/stores/auth.store";
import type { ListReportsQuery } from "@/types/api/report.types";
import { ArchivedReportList } from "./ArchivedReportList";
import { OfficeReportFilters } from "./OfficeReportFilters";
import { OfficeReportTable } from "./OfficeReportTable";
import { ReportPdfExportControl } from "./ReportPdfExportControl";

const INITIAL_FILTERS: ListReportsQuery = {
  page: 1,
  pageSize: 10,
  archiveState: "active",
  sortBy: "reportDate",
  sortOrder: "desc",
};

export function OfficeReportListContent({ view = "reports" }: { view?: "reports" | "archive" }) {
  const role = useAuthStore((state) => state.user?.role);
  const canArchive = role === "OWNER" || role === "ADMIN";
  const showArchive = canArchive && view === "archive";
  const [filters, setFilters] = useState<ListReportsQuery>(INITIAL_FILTERS);
  const reportsQuery = useOfficeReportsQuery(filters, !showArchive, { keepPreviousData: true });
  const activeCountQuery = useOfficeReportsQuery(
    { page: 1, pageSize: 1, archiveState: "active" },
    canArchive && showArchive,
  );
  const archiveCountQuery = useArchivedReportsQuery(
    { page: 1, pageSize: 1 },
    canArchive,
  );

  function handleFilterPatch(patch: Partial<ListReportsQuery>) {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Laporan Harian"
        titleSuffix={
          <PageInfoDialog
            title="Tentang Laporan Harian"
            description="Daftar laporan harian lapangan seluruh proyek beserta dokumentasi foto dan riwayat revisi."
          />
        }
        action={canArchive ? <ReportPdfExportControl /> : undefined}
      />

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        {canArchive && (
          <UnderlineTabsBar
            ariaLabel="Tampilan laporan"
            activeValue={showArchive ? "archive" : "reports"}
            items={[
              {
                value: "reports",
                label: "Laporan Aktif",
                href: "/office/reports",
                count: showArchive
                  ? activeCountQuery.data?.meta.totalItems
                  : reportsQuery.data?.meta.totalItems,
              },
              {
                value: "archive",
                label: "Arsip Harian",
                href: "/office/reports?view=archive",
                count: archiveCountQuery.data?.meta.totalItems,
              },
            ]}
            hideRightSlotOnMobile
            rightSlot={
              showArchive
                ? "Laporan terkirim yang telah melewati tanggal laporan"
                : "Laporan terkirim otomatis masuk arsip setelah tanggal laporan lewat"
            }
          />
        )}

        {showArchive ? (
          <ArchivedReportList />
        ) : (
          <div>
            <div className="p-4 sm:px-5">
              <OfficeReportFilters
                filters={filters}
                onChange={handleFilterPatch}
                onReset={() => setFilters(INITIAL_FILTERS)}
              />
            </div>

            <AsyncStateView
              isLoading={reportsQuery.isLoading}
              isError={reportsQuery.isError}
              error={reportsQuery.error}
              data={reportsQuery.data}
              isEmpty={(res) => res.data.length === 0}
              onRetry={() => reportsQuery.refetch()}
              emptyTitle="Belum ada laporan sesuai filter"
              emptyDescription="Coba ubah proyek, rentang tanggal, atau kriteria pencarian laporan."
            >
              {(res) => (
                <OfficeReportTable
                  data={res.data}
                  meta={res.meta}
                  bare
                  onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                  onPageSizeChange={(pageSize) => setFilters((prev) => ({ ...prev, pageSize, page: 1 }))}
                  isUpdating={reportsQuery.isPlaceholderData}
                />
              )}
            </AsyncStateView>
          </div>
        )}
      </section>
    </div>
  );
}
