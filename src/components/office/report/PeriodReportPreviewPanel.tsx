"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOfficeReportsQuery } from "@/hooks/report.hooks";
import { pdfExportApi } from "@/lib/api/pdf-export.api";
import { OfficeReportTable } from "./OfficeReportTable";

export function PeriodMonthlyPreviewPanel({
  projectId,
  month,
}: {
  projectId: string;
  month: string;
}) {
  const summaryQuery = useQuery({
    queryKey: ["pdf-export", "monthly-summary", projectId, month],
    queryFn: () => pdfExportApi.getMonthlyReportSummary({ projectId, month }),
    enabled: Boolean(projectId && /^\d{4}-\d{2}$/.test(month)),
  });

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface tabular-nums">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-semibold text-text-primary">
          Pratinjau Rekap Kepatuhan Bulanan ({month})
        </h2>
        <span className="text-xs text-text-muted">
          {summaryQuery.data?.areas.length ?? 0} area terdaftar
        </span>
      </div>

      <AsyncStateView
        isLoading={summaryQuery.isLoading}
        isError={summaryQuery.isError}
        error={summaryQuery.error}
        data={summaryQuery.data}
        isEmpty={(res) => res.areas.length === 0}
        onRetry={() => void summaryQuery.refetch()}
        emptyTitle="Belum ada area terdaftar pada proyek ini"
        emptyDescription="Tambahkan area dan penugasan pengawas untuk melihat rekap bulanan."
      >
        {(res) => (
          <>
            <div className="divide-y divide-border/70 md:hidden">
              {res.areas.map((area) => (
                <div key={area.areaCode} className="space-y-2 p-4">
                  <p className="text-[13px] font-semibold text-text-primary">
                    <span className="text-text-muted">{area.areaCode}</span> {area.areaName}
                  </p>
                  <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-border/70 bg-canvas/50 p-2 text-center text-xs">
                    <div>
                      <p className="text-[10px] text-text-muted">Wajib</p>
                      <p className="mt-0.5 font-semibold text-text-primary">{area.requiredDays}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted">Tepat</p>
                      <p className="mt-0.5 font-semibold text-status-success-fg">{area.onTime}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted">Telat</p>
                      <p className="mt-0.5 font-semibold text-status-warning-fg">{area.late}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted">Belum</p>
                      <p className={`mt-0.5 font-semibold ${area.missing > 0 ? "text-status-danger-fg" : "text-text-muted"}`}>
                        {area.missing}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block">
              <Table>
                <TableHeader className="bg-surface-input/50">
                  <TableRow className="border-border/80 hover:bg-transparent">
                    <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">Area</TableHead>
                    <TableHead className="h-10 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">Hari Wajib</TableHead>
                    <TableHead className="h-10 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">Tepat Waktu</TableHead>
                    <TableHead className="h-10 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">Terlambat</TableHead>
                    <TableHead className="h-10 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">Belum Lapor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {res.areas.map((area) => (
                    <TableRow key={area.areaCode} className="border-border/60 hover:bg-surface-input/40">
                      <TableCell className="px-4 py-3 text-[13px] font-medium text-text-primary">
                        <span className="text-text-muted">{area.areaCode}</span> {area.areaName}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right text-[13px] text-text-primary">{area.requiredDays}</TableCell>
                      <TableCell className="px-4 py-3 text-right text-[13px] font-medium text-status-success-fg">{area.onTime}</TableCell>
                      <TableCell className="px-4 py-3 text-right text-[13px] font-medium text-status-warning-fg">{area.late}</TableCell>
                      <TableCell className={`px-4 py-3 text-right text-[13px] font-medium ${area.missing > 0 ? "text-status-danger-fg" : "text-text-muted"}`}>
                        {area.missing}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </AsyncStateView>
    </section>
  );
}

export function PeriodDailyPreviewPanel({
  projectId,
  fromDate,
  toDate,
  validRange,
}: {
  projectId: string;
  fromDate: string;
  toDate: string;
  validRange: boolean;
}) {
  const rangeKey = `${projectId}:${fromDate}:${toDate}`;
  const [pagination, setPagination] = useState({ rangeKey, page: 1, pageSize: 10 });
  const page = pagination.rangeKey === rangeKey ? pagination.page : 1;
  const pageSize = pagination.pageSize;

  const reportsQuery = useOfficeReportsQuery(
    {
      projectId,
      dateFrom: fromDate,
      dateTo: toDate,
      archiveState: "all",
      page,
      pageSize,
      sortBy: "reportDate",
      sortOrder: "desc",
    },
    Boolean(projectId && fromDate && toDate && validRange),
    { keepPreviousData: true },
  );

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface tabular-nums">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-semibold text-text-primary">
          Laporan Masuk pada Rentang Terpilih
        </h2>
        <span className="text-xs text-text-muted">
          {reportsQuery.data?.meta.totalItems ?? 0} laporan terkirim
        </span>
      </div>

      <AsyncStateView
        isLoading={reportsQuery.isLoading}
        isError={reportsQuery.isError}
        error={reportsQuery.error}
        data={reportsQuery.data}
        isEmpty={(res) => res.data.length === 0}
        onRetry={() => void reportsQuery.refetch()}
        emptyTitle="Belum ada laporan terkirim pada rentang ini"
        emptyDescription="Area wajib lapor tanpa laporan akan ditandai 'Belum lapor' saat PDF diunduh."
      >
        {(res) => (
          <OfficeReportTable
            data={res.data}
            meta={res.meta}
            bare
            onPageChange={(nextPage) => setPagination((prev) => ({ ...prev, rangeKey, page: nextPage }))}
            onPageSizeChange={(nextSize) => setPagination({ rangeKey, page: 1, pageSize: nextSize })}
            isUpdating={reportsQuery.isPlaceholderData}
          />
        )}
      </AsyncStateView>
    </section>
  );
}
