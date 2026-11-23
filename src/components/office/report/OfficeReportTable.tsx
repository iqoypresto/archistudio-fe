import Link from "next/link";
import { Eye } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ServerDataTable, type DataColumn } from "@/components/ui/ServerDataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types/api";
import type { DailyReportListItem } from "@/types/api/report.types";

const COLUMNS: DataColumn<DailyReportListItem>[] = [
  {
    key: "number",
    header: "Nomor & Tanggal",
    cell: (row) => (
      <div className="space-y-0.5">
        <p className="font-mono text-xs font-semibold text-text-primary">{row.reportNumber}</p>
        <p className="font-mono text-xs tabular-nums text-text-secondary">{row.reportDate}</p>
      </div>
    ),
  },
  {
    key: "area",
    header: "Project / Area",
    cell: (row) => (
      <div>
        <p className="font-medium text-text-primary">{row.project.name}</p>
        <p className="text-xs text-text-secondary">
          {row.area.code} — {row.area.name}
        </p>
      </div>
    ),
  },
  {
    key: "supervisor",
    header: "Supervisor",
    cell: (row) => (
      <div>
        <p className="font-medium text-text-primary">{row.supervisor.name}</p>
        <p className="text-xs text-text-secondary">{row.photoCount} foto</p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => (
      <div className="flex flex-wrap gap-1.5">
        <StatusBadge tone={row.isLate ? "warning" : "success"}>
          {row.isLate ? row.lateLabel ?? "Diunggah terlambat" : "Tepat Waktu"}
        </StatusBadge>
        {row.isRevised && <StatusBadge tone="info">Direvisi</StatusBadge>}
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
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "h-8 gap-1.5 border-border bg-surface-input px-2.5 text-xs text-text-secondary hover:bg-surface-active hover:text-text-primary"
        )}
      >
        <Eye className="size-3.5" />
        Detail
      </Link>
    ),
  },
];

export function OfficeReportTable({
  data,
  meta,
  onPageChange,
}: {
  data: DailyReportListItem[];
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  return (
    <ServerDataTable
      columns={COLUMNS}
      data={data}
      getRowKey={(row) => row.id}
      meta={meta}
      onPageChange={onPageChange}
    />
  );
}
