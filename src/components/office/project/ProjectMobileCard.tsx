"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { formatIdDate, formatShortTimezone } from "@/lib/utils/office-format";
import type { ProjectListItem, ProjectStatus } from "@/types/api/project.types";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function resolveStatusInfo(status: ProjectStatus): { tone: "success" | "muted"; label: string } {
  if (status === "BERJALAN") return { tone: "success", label: "Berjalan" };
  if (status === "SELESAI") return { tone: "success", label: "Selesai" };
  return { tone: "muted", label: "Persiapan" };
}

interface ProjectMobileCardProps {
  row: ProjectListItem;
  canManage: boolean;
  canArchive: boolean;
  onEdit: (project: ProjectListItem) => void;
  onArchive: (project: ProjectListItem) => void;
}

export function ProjectMobileCard({
  row,
  canManage,
  canArchive,
  onEdit,
  onArchive,
}: ProjectMobileCardProps) {
  const info = resolveStatusInfo(row.status);
  const holidays = row.routineHolidays?.map((d) => DAY_NAMES[d] ?? d).join(", ") || "-";

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted">{row.code}</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-text-primary">{row.name}</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            {row.clientName} · {row.location}
          </p>
        </div>
        <StatusIndicator tone={info.tone} className="shrink-0 text-xs">
          {info.label}
        </StatusIndicator>
      </div>

      <div className="space-y-0.5 text-xs text-text-muted">
        <p>
          Site Manager:{" "}
          <span className="font-medium text-text-secondary">
            {row.siteManager?.name ?? "Belum ditetapkan"}
          </span>{" "}
          · {row._count?.areas ?? 0} area
        </p>
        <p>
          {formatIdDate(row.startDate)} — {row.endDate ? formatIdDate(row.endDate) : "Fleksibel"} ·{" "}
          {formatShortTimezone(row.timezone)} · Libur: {holidays}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/office/projects/${row.id}`}
          className="col-span-2 inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-input px-3 text-xs font-medium text-text-primary transition-colors hover:bg-surface-active"
        >
          Buka Detail Project
          <ArrowRight className="size-3.5" />
        </Link>
        {canManage && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={canArchive ? "h-10 text-xs" : "col-span-2 h-10 text-xs"}
            onClick={() => onEdit(row)}
          >
            Ubah Proyek
          </Button>
        )}
        {canArchive && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className={canManage ? "h-10 text-xs" : "col-span-2 h-10 text-xs"}
            onClick={() => onArchive(row)}
          >
            Arsipkan
          </Button>
        )}
      </div>
    </div>
  );
}
