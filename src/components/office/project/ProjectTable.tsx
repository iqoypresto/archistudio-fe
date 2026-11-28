"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServerDataTable, type DataColumn } from "@/components/ui/ServerDataTable";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { formatIdDate, formatShortTimezone } from "@/lib/utils/office-format";
import type { PaginationMeta } from "@/types/api";
import type { ProjectListItem, ProjectStatus } from "@/types/api/project.types";

interface ProjectTableProps {
  projects: ProjectListItem[];
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isUpdating?: boolean;
  onEdit: (project: ProjectListItem) => void;
  onArchive: (project: ProjectListItem) => void;
  canManage: boolean;
  canArchive: boolean;
}

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function resolveStatusInfo(status: ProjectStatus): { tone: "success" | "muted"; label: string } {
  if (status === "BERJALAN") return { tone: "success", label: "Berjalan" };
  if (status === "SELESAI") return { tone: "success", label: "Selesai" };
  return { tone: "muted", label: "Persiapan" };
}

export function ProjectTable({
  projects,
  meta,
  onPageChange,
  onPageSizeChange,
  isUpdating = false,
  onEdit,
  onArchive,
  canManage,
  canArchive,
}: ProjectTableProps) {
  const columns: DataColumn<ProjectListItem>[] = [
    {
      key: "project",
      header: "Proyek & Klien",
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="text-[13px] font-medium text-text-primary">
            <span className="text-text-muted">{row.code}</span> {row.name}
          </p>
          <p className="text-xs text-text-secondary">
            {row.clientName} · {row.location}
          </p>
        </div>
      ),
    },
    {
      key: "team",
      header: "Tim & Area",
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="text-[13px] font-medium text-text-primary">
            {row.siteManager?.name ?? "Belum ditetapkan"}
          </p>
          <p className="text-xs text-text-muted">
            {row._count?.areas ?? 0} area terdaftar
          </p>
        </div>
      ),
    },
    {
      key: "schedule",
      header: "Jadwal & Zona",
      cell: (row) => {
        const holidays = row.routineHolidays?.map((d) => DAY_NAMES[d] ?? d).join(", ") || "-";
        return (
          <div className="space-y-0.5">
            <p className="text-[13px] text-text-primary">
              {formatIdDate(row.startDate)} — {row.endDate ? formatIdDate(row.endDate) : "Fleksibel"}
            </p>
            <p className="text-xs text-text-muted">
              {formatShortTimezone(row.timezone)} · Libur: {holidays}
            </p>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => {
        const info = resolveStatusInfo(row.status);
        return <StatusIndicator tone={info.tone}>{info.label}</StatusIndicator>;
      },
    },
    {
      key: "actions",
      header: "Aksi",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {canManage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs text-text-secondary hover:text-text-primary"
              onClick={() => onEdit(row)}
            >
              Ubah
            </Button>
          )}
          {canArchive && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => onArchive(row)}
            >
              Arsipkan
            </Button>
          )}
          <Link
            href={`/office/projects/${row.id}`}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-surface-input px-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-active hover:text-text-primary"
          >
            Detail
            <ArrowRight className="size-3" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <ServerDataTable
      columns={columns}
      data={projects}
      getRowKey={(row) => row.id}
      meta={meta}
      bare
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isUpdating={isUpdating}
    />
  );
}
