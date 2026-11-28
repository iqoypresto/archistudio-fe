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

const quickLinkClass =
  "inline-flex min-h-10 items-center gap-1 rounded-lg border border-border bg-surface-input px-3 text-xs text-text-secondary transition-colors hover:bg-surface-active hover:text-text-primary sm:min-h-0 sm:border-0 sm:bg-transparent sm:px-0 sm:underline-offset-4 sm:hover:bg-transparent sm:hover:underline";

export function ProjectDetailHeader({
  project, canEditProject, canCompleteProject, canArchiveProject, canRestoreProject,
  isSupervisorReadOnly, isProjectReadOnly,
  onEditProject, onCompleteProject, onArchiveProject, onRestoreProject,
}: ProjectDetailHeaderProps) {
  const statusInfo = project ? resolveStatus(project) : null;
  const holidays = project?.routineHolidays?.map((d) => DAY_NAMES[d] ?? d).join(", ") || "-";

  return (
    <div className="space-y-4 tabular-nums">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Link
          href={isProjectReadOnly ? "/office/archive" : "/office/projects"}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-10 w-fit gap-1.5 border-border bg-surface px-3 text-xs text-text-secondary hover:bg-surface-active hover:text-text-primary sm:h-9",
          )}
        >
          <ArrowLeft className="size-3.5" />
          {isProjectReadOnly ? "Kembali ke Archive" : "Kembali ke Proyek"}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {canEditProject && (
            <Button type="button" variant="outline" size="sm" onClick={onEditProject} className="h-10 flex-1 px-3 text-xs sm:h-9 sm:flex-none">
              Ubah Proyek
            </Button>
          )}
          {canCompleteProject && (
            <Button type="button" variant="outline" size="sm" onClick={onCompleteProject} className="h-10 flex-1 px-3 text-xs sm:h-9 sm:flex-none">
              Tandai Selesai
            </Button>
          )}
          {canArchiveProject && (
            <Button type="button" variant="destructive" size="sm" onClick={onArchiveProject} className="h-10 px-3 text-xs sm:h-9">
              Arsipkan
            </Button>
          )}
          {canRestoreProject && (
            <Button type="button" size="sm" onClick={onRestoreProject} className="h-10 w-full px-3 text-xs sm:h-9 sm:w-auto">
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
              <StatusIndicator tone={statusInfo.tone} className="text-xs">{statusInfo.label}</StatusIndicator>
            </>
          )}
        </div>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-text-primary sm:text-[22px]">
          {project?.name ?? "Memuat Project..."}
        </h1>
      </div>

      {project && (
        <>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
            <div className="bg-surface p-3.5 sm:p-4">
              <p className="text-[11px] font-medium tracking-wider text-text-muted uppercase">Klien &amp; Lokasi</p>
              <p className="mt-1 text-[13px] font-medium text-text-primary">{project.clientName}</p>
              <p className="mt-0.5 text-xs text-text-secondary">{project.location}</p>
            </div>
            <div className="bg-surface p-3.5 sm:p-4">
              <p className="text-[11px] font-medium tracking-wider text-text-muted uppercase">Site Manager</p>
              <p className="mt-1 text-[13px] font-medium text-text-primary">{project.siteManager?.name ?? "Belum ditetapkan"}</p>
              <p className="mt-0.5 text-xs text-text-secondary">{project.siteManager?.phone ?? "Penanggung jawab proyek"}</p>
            </div>
            <div className="bg-surface p-3.5 sm:p-4">
              <p className="text-[11px] font-medium tracking-wider text-text-muted uppercase">Jadwal Pelaksanaan</p>
              <p className="mt-1 text-[13px] font-medium text-text-primary">{formatIdDate(project.startDate)}</p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Target: {project.endDate ? formatIdDate(project.endDate) : "Fleksibel"}
              </p>
            </div>
            <div className="bg-surface p-3.5 sm:p-4">
              <p className="text-[11px] font-medium tracking-wider text-text-muted uppercase">Zona &amp; Libur</p>
              <p className="mt-1 text-[13px] font-medium text-text-primary">
                {formatShortTimezone(project.timezone)} ({project.timezone})
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">Libur: {holidays}</p>
            </div>
          </div>

          {project._count && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3 text-xs text-text-secondary sm:gap-x-5 sm:gap-y-2 sm:px-4 sm:py-2.5">
              <span className="inline-flex min-h-10 items-center px-1 sm:min-h-0 sm:px-0">
                Area: <strong className="ml-1 font-semibold text-text-primary">{project._count.areas}</strong>
              </span>
              {project._count.drawings !== undefined && (
                <Link href={`/office/projects/${project.id}/drawings`} className={quickLinkClass}>
                  Drawing aktif: <strong className="font-semibold text-text-primary">{project._count.drawings}</strong>
                </Link>
              )}
              {project._count.commsEntries !== undefined && (
                <Link href={`/office/projects/${project.id}/comms/in`} className={quickLinkClass}>
                  Catatan Comms: <strong className="font-semibold text-text-primary">{project._count.commsEntries}</strong>
                </Link>
              )}
              {project._count.documents !== undefined && (canCompleteProject || canRestoreProject) && (
                <Link href={`/office/projects/${project.id}/document-out`} className={quickLinkClass}>
                  Document Out: <strong className="font-semibold text-text-primary">{project._count.documents}</strong>
                </Link>
              )}
            </div>
          )}
        </>
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
