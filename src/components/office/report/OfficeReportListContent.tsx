"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { ArchivedReportList } from "./ArchivedReportList";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
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
    <div className="space-y-5">
      <PageHeader
        title="Laporan Harian"
        description="Daftar laporan harian lapangan seluruh project beserta detail foto dan riwayat revisi."
        action={canArchive ? <ReportPdfExportControl /> : undefined}
      />

      <section className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
        {canArchive && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <nav
              aria-label="Tampilan laporan"
              className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-surface-input p-1"
            >
              <Link
                href="/reports"
                aria-current={!showArchive ? "page" : undefined}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  !showArchive
                    ? "bg-surface-active text-text-primary shadow-2xs ring-1 ring-white/[0.06]"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Laporan Aktif
              </Link>
              <Link
                href="/reports?view=archive"
                aria-current={showArchive ? "page" : undefined}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  showArchive
                    ? "bg-surface-active text-text-primary shadow-2xs ring-1 ring-white/[0.06]"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Arsip Harian
              </Link>
            </nav>
            <span className="text-xs text-text-muted">
              {showArchive ? "Laporan harian yang telah masuk arsip" : "Laporan harian aktif"}
            </span>
          </div>
        )}

        {showArchive ? (
          <ArchivedReportList />
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface-input/60 p-3">
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
          </div>
        )}
      </section>
    </div>
  );
}
