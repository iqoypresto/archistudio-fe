"use client";

import { Archive, ChevronRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServerDataTable, type DataColumn } from "@/components/ui/ServerDataTable";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import type { PaginationMeta } from "@/types/api";
import type { ProjectListItem, ProjectStatus } from "@/types/api/project.types";

interface ProjectTableProps {
  projects: ProjectListItem[];
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onEdit: (project: ProjectListItem) => void;
  onArchive: (project: ProjectListItem) => void;
}

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function resolveStatusTone(status: ProjectStatus): StatusTone {
  switch (status) {
    case "PERSIAPAN":
      return "muted";
    case "BERJALAN":
      return "info";
    case "SELESAI":
      return "success";
  }
}

function resolveTzShort(tz: string): string {
  if (tz === "Asia/Jakarta") return "WIB";
  if (tz === "Asia/Makassar") return "WITA";
  if (tz === "Asia/Jayapura") return "WIT";
  return tz;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Fleksibel";
  return dateStr.slice(0, 10);
}

export function ProjectTable({
  projects,
  meta,
  onPageChange,
  onEdit,
  onArchive,
}: ProjectTableProps) {
  const columns: DataColumn<ProjectListItem>[] = [
    {
      key: "code",
      header: "Kode & Status",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs font-bold tracking-wider text-text-primary">
            {row.code}
          </span>
          <StatusBadge tone={resolveStatusTone(row.status)} className="w-fit">
            {row.status === "PERSIAPAN"
              ? "Persiapan"
              : row.status === "BERJALAN"
                ? "Berjalan"
                : "Selesai"}
          </StatusBadge>
        </div>
      ),
    },
    {
      key: "name",
      header: "Nama Project & Client",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary">{row.name}</span>
          <span className="text-xs text-text-secondary">
            Client: {row.clientName} • Lokasi: {row.location}
          </span>
        </div>
      ),
    },
    {
      key: "schedule",
      header: "Jadwal Pelaksanaan",
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span className="text-text-primary">Mulai: {formatDate(row.startDate)}</span>
          <span className="text-text-secondary">
            Selesai: {row.endDate ? formatDate(row.endDate) : "Fleksibel (BR-07)"}
          </span>
        </div>
      ),
    },
    {
      key: "timezone",
      header: "Zona & Hari Libur",
      cell: (row) => {
        const holidays = row.routineHolidays?.map((d) => DAY_NAMES[d] ?? d).join(", ") || "-";
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-text-primary">
              {resolveTzShort(row.timezone)} ({row.timezone})
            </span>
            <span className="text-text-secondary">Libur Rutin: {holidays}</span>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Aksi",
      cellClassName: "text-right",
      headerClassName: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(row)}
            title="Ubah Data Project"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-status-danger-fg hover:bg-status-danger-bg/50"
            onClick={() => onArchive(row)}
            title="Arsipkan Project"
          >
            <Archive className="h-4 w-4" />
          </Button>
          <a
            href={`/projects/${row.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-subtle"
            title="Lihat Detail Area"
          >
            <ChevronRight className="h-4 w-4 text-text-secondary" />
          </a>
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
      onPageChange={onPageChange}
    />
  );
}
