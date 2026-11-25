"use client";

import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { cn } from "@/lib/utils";
import { formatIdDate, formatShortTimezone } from "@/lib/utils/office-format";
import type { ProjectDetail, ProjectStatus } from "@/types/api/project.types";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

interface ProjectDetailHeaderProps {
  project?: ProjectDetail;
  canEditProject: boolean;
  canCompleteProject: boolean;
  canArchiveProject: boolean;
  canRestoreProject: boolean;
  isSupervisorReadOnly: boolean;
  isProjectReadOnly: boolean;
  onEditProject: () => void;
  onCompleteProject: () => void;
  onArchiveProject: () => void;
  onRestoreProject: () => void;
}

function resolveStatus(project: ProjectDetail): { tone: "success" | "warning" | "muted"; label: string } {
  if (project.archivedAt && project.status !== "SELESAI") {
    return { tone: "warning", label: "Arsip Manual" };
  }
  const map: Record<ProjectStatus, { tone: "success" | "muted"; label: string }> = {
    BERJALAN: { tone: "success", label: "Berjalan" },
    SELESAI: { tone: "success", label: "Selesai" },
    PERSIAPAN: { tone: "muted", label: "Persiapan" },
  };
  return map[project.status];
}

export function ProjectDetailHeader({
  project,
  canEditProject,
  canCompleteProject,
  canArchiveProject,
  canRestoreProject,
  isSupervisorReadOnly,
  isProjectReadOnly,
  onEditProject,
  onCompleteProject,
  onArchiveProject,
  onRestoreProject,
}: ProjectDetailHeaderProps) {
  const statusInfo = project ? resolveStatus(project) : null;
  const holidays = project?.routineHolidays?.map((d) => DAY_NAMES[d] ?? d).join(", ") || "-";

  return (
    <div className="space-y-4 tabular-nums">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={isProjectReadOnly ? "/office/archive" : "/office/projects"}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 gap-1.5 border-border bg-surface px-3 text-xs text-text-secondary hover:bg-surface-active hover:text-text-primary",
          )}
        >
          <ArrowLeft className="size-3.5" />
          {isProjectReadOnly ? "Kembali ke Archive" : "Kembali ke Proyek"}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {canEditProject && (
            <Button type="button" variant="outline" size="sm" onClick={onEditProject} className="h-9 px-3 text-xs">
              Ubah Proyek
            </Button>
          )}
          {canCompleteProject && (
            <Button type="button" variant="outline" size="sm" onClick={onCompleteProject} className="h-9 px-3 text-xs">
              Tandai Selesai
            </Button>
          )}
          {canArchiveProject && (
            <Button type="button" variant="destructive" size="sm" onClick={onArchiveProject} className="h-9 px-3 text-xs">
              Arsipkan
            </Button>
          )}
          {canRestoreProject && (
            <Button type="button" size="sm" onClick={onRestoreProject} className="h-9 px-3 text-xs">
              Pulihkan Project
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-text-muted">
          <span className="font-medium text-text-secondary">{project?.code ?? "..."}</span>
          {statusInfo && (
            <>
              <span>·</span>
              <StatusIndicator tone={statusInfo.tone} className="text-xs">
                {statusInfo.label}
              </StatusIndicator>
            </>
          )}
        </div>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-text-primary sm:text-[22px]">
          {project?.name ?? "Memuat Project..."}
        </h1>
      </div>

      {project && (
        <div className="grid grid-cols-1 divide-y divide-border rounded-xl border border-border bg-surface sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          <div className="p-4">
            <p className="text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Klien &amp; Lokasi
            </p>
            <p className="mt-1 text-[13px] font-medium text-text-primary">{project.clientName}</p>
            <p className="mt-0.5 text-xs text-text-secondary">{project.location}</p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Site Manager
            </p>
            <p className="mt-1 text-[13px] font-medium text-text-primary">
              {project.siteManager?.name ?? "Belum ditetapkan"}
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {project.siteManager?.phone ?? "Penanggung jawab proyek"}
            </p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Jadwal Pelaksanaan
            </p>
            <p className="mt-1 text-[13px] font-medium text-text-primary">
              {formatIdDate(project.startDate)}
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              Target selesai: {project.endDate ? formatIdDate(project.endDate) : "Fleksibel"}
            </p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Zona &amp; Hari Libur
            </p>
            <p className="mt-1 text-[13px] font-medium text-text-primary">
              {formatShortTimezone(project.timezone)} ({project.timezone})
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">Libur rutin: {holidays}</p>
          </div>
        </div>
      )}

      {(isSupervisorReadOnly || isProjectReadOnly) && (
        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-xs text-text-secondary">
          <Info className="mt-0.5 size-4 shrink-0 text-text-muted" />
          <span>
            {isSupervisorReadOnly
              ? "Mode baca saja: hanya area yang sedang ditugaskan kepada Anda pada proyek ini yang ditampilkan."
              : "Proyek ini berada di Archive sehingga seluruh data bersifat baca saja hingga dipulihkan kembali oleh Owner."}
          </span>
        </div>
      )}
    </div>
  );
}
