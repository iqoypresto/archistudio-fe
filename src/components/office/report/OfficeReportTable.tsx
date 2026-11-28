import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServerDataTable, type DataColumn } from "@/components/ui/ServerDataTable";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { formatIdDate, formatTimeInTimezone } from "@/lib/utils/office-format";
import { getRoleLabel } from "@/lib/utils/role";
import type { PaginationMeta } from "@/types/api";
import type { DailyReportListItem } from "@/types/api/report.types";

function buildColumns(showArchivedAt: boolean): DataColumn<DailyReportListItem>[] {
  return [
    {
      key: "number",
      header: "Nomor & Tanggal",
      cell: (row) => {
        const sentTime = formatTimeInTimezone(row.submittedAt, row.project.timezone);
        return (
          <div className="space-y-0.5">
            <p className="text-[13px] font-medium text-text-primary">{row.reportNumber}</p>
            <p className="text-xs text-text-muted">
              {formatIdDate(row.reportDate)}
              {sentTime ? ` · ${sentTime}` : ""}
            </p>
          </div>
        );
      },
    },
    {
      key: "area",
      header: "Proyek & Area",
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="text-[13px] font-medium text-text-primary">{row.project.name}</p>
          <p className="text-xs text-text-secondary">
            {row.area.code} · {row.area.name}
          </p>
        </div>
      ),
    },
    {
      key: "supervisor",
      header: "Pengawas & Tipe",
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="text-[13px] font-medium text-text-primary">
            {row.supervisor.name}
            {row.supervisor.role === "SITE_MANAGER" && (
              <span className="ml-1.5 text-xs font-normal text-text-muted">
                ({getRoleLabel(row.supervisor.role)})
              </span>
            )}
          </p>
          <p className="text-xs text-text-muted">
            {row.reportType === "WORK" ? "Ada Pekerjaan" : "Tanpa Pekerjaan"} · {row.photoCount}{" "}
            foto
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <div className="space-y-1">
          <StatusIndicator tone={row.isLate ? "warning" : "success"}>
            {row.isLate ? row.lateLabel ?? "Diunggah Terlambat" : "Tepat Waktu"}
          </StatusIndicator>
          {row.isRevised && (
            <p className="text-xs text-text-muted">Direvisi Owner</p>
          )}
          {showArchivedAt && row.archivedAt && (
            <p className="text-xs text-text-muted">Diarsipkan {formatIdDate(row.archivedAt)}</p>
          )}
        </div>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <Link
          href={`/office/reports/${row.id}`}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-surface-input px-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-active hover:text-text-primary"
        >
          Detail
          <ArrowRight className="size-3" />
        </Link>
      ),
    },
  ];
}

function ReportMobileCard({
  row,
  showArchivedAt,
}: {
  row: DailyReportListItem;
  showArchivedAt: boolean;
}) {
  const sentTime = formatTimeInTimezone(row.submittedAt, row.project.timezone);
  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-text-primary">{row.reportNumber}</p>
          <p className="mt-0.5 text-xs text-text-muted">
            {formatIdDate(row.reportDate)}
            {sentTime ? ` · ${sentTime}` : ""}
          </p>
        </div>
        <StatusIndicator tone={row.isLate ? "warning" : "success"} className="shrink-0 text-xs">
          {row.isLate ? row.lateLabel ?? "Terlambat" : "Tepat Waktu"}
        </StatusIndicator>
      </div>

      <div className="space-y-0.5 text-xs">
        <p className="font-medium text-text-primary">
          {row.project.name} · <span className="text-text-secondary">{row.area.code} {row.area.name}</span>
        </p>
        <p className="text-text-muted">
          {row.supervisor.name}
          {row.supervisor.role === "SITE_MANAGER" ? ` (${getRoleLabel(row.supervisor.role)})` : ""} ·{" "}
          {row.reportType === "WORK" ? "Ada Pekerjaan" : "Tanpa Pekerjaan"} · {row.photoCount} foto
        </p>
        {(row.isRevised || (showArchivedAt && row.archivedAt)) && (
          <p className="text-[11px] text-text-muted">
            {[
              row.isRevised ? "Direvisi Owner" : null,
              showArchivedAt && row.archivedAt ? `Diarsipkan ${formatIdDate(row.archivedAt)}` : null,
            ].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      <Link
        href={`/office/reports/${row.id}`}
        className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-input px-3 text-xs font-medium text-text-primary transition-colors hover:bg-surface-active"
      >
        Lihat Detail Laporan
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

export function OfficeReportTable({
  data,
  meta,
  bare = false,
  showArchivedAt = false,
  onPageChange,
  onPageSizeChange,
  isUpdating = false,
}: {
  data: DailyReportListItem[];
  meta: PaginationMeta;
  bare?: boolean;
  showArchivedAt?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isUpdating?: boolean;
}) {
  return (
    <ServerDataTable
      columns={buildColumns(showArchivedAt)}
      data={data}
      getRowKey={(row) => row.id}
      renderMobileCard={(row) => <ReportMobileCard row={row} showArchivedAt={showArchivedAt} />}
      meta={meta}
      bare={bare}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isUpdating={isUpdating}
    />
  );
}
