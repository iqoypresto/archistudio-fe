import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServerDataTable, type DataColumn } from "@/components/ui/ServerDataTable";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { formatIdDate, formatTimeInTimezone } from "@/lib/utils/office-format";
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
      header: "Supervisor & Tipe",
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="text-[13px] font-medium text-text-primary">{row.supervisor.name}</p>
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
          href={`/reports/${row.id}`}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-surface-input px-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-active hover:text-text-primary"
        >
          Detail
          <ArrowRight className="size-3" />
        </Link>
      ),
    },
  ];
}

export function OfficeReportTable({
  data,
  meta,
  bare = false,
  showArchivedAt = false,
  onPageChange,
}: {
  data: DailyReportListItem[];
  meta: PaginationMeta;
  bare?: boolean;
  showArchivedAt?: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <ServerDataTable
      columns={buildColumns(showArchivedAt)}
      data={data}
      getRowKey={(row) => row.id}
      meta={meta}
      bare={bare}
      onPageChange={onPageChange}
      className={bare ? "space-y-0 [&>div:last-child]:border-t [&>div:last-child]:border-border [&>div:last-child]:px-4 [&>div:last-child]:py-3" : undefined}
    />
  );
}
