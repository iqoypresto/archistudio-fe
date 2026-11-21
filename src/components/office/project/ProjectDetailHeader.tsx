"use client";

import Link from "next/link";
import { Archive, ArrowLeft, CheckCircle2, Info, MapPin, Plus, RotateCcw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ProjectDetail, ProjectStatus } from "@/types/api/project.types";

interface ProjectDetailHeaderProps {
  project?: ProjectDetail;
  canEditArea: boolean;
  canCompleteProject: boolean;
  canArchiveProject: boolean;
  canRestoreProject: boolean;
  isSupervisorReadOnly: boolean;
  isProjectReadOnly: boolean;
  onAddArea: () => void;
  onCompleteProject: () => void;
  onArchiveProject: () => void;
  onRestoreProject: () => void;
}

function getStatusTone(status: ProjectStatus): "info" | "success" | "muted" {
  if (status === "BERJALAN") return "info";
  return status === "SELESAI" ? "success" : "muted";
}

export function ProjectDetailHeader({
  project,
  canEditArea,
  canCompleteProject,
  canArchiveProject,
  canRestoreProject,
  isSupervisorReadOnly,
  isProjectReadOnly,
  onAddArea,
  onCompleteProject,
  onArchiveProject,
  onRestoreProject,
}: ProjectDetailHeaderProps) {
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={isProjectReadOnly ? "/archive" : "/projects"}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-active hover:text-text-primary"
            title={isProjectReadOnly ? "Kembali ke Archive Project" : "Kembali ke Daftar Project"}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-border/80 bg-surface-input px-2 py-0.5 font-mono text-xs font-semibold text-text-primary">
                {project?.code ?? "..."}
              </span>
              <h1 className="font-heading text-xl font-semibold tracking-tight text-text-primary sm:text-[22px]">
                {project?.name ?? "Memuat Project..."}
              </h1>
              {project && (
                <StatusBadge tone={getStatusTone(project.status)}>{project.status}</StatusBadge>
              )}
              {project?.archivedAt && <StatusBadge tone="warning">Arsip Manual</StatusBadge>}
            </div>
            {project && (
              <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3 w-3 text-text-muted" /> Client: {project.clientName}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-text-muted" /> Lokasi: {project.location}
                </span>
                <span className="text-text-muted">Zona: {project.timezone}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canCompleteProject && (
            <Button variant="outline" onClick={onCompleteProject} className="h-9 gap-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-status-success-fg" />
              Tandai Selesai
            </Button>
          )}
          {canArchiveProject && (
            <Button variant="outline" onClick={onArchiveProject} className="h-9 gap-1.5 text-xs">
              <Archive className="h-3.5 w-3.5 text-status-warning-fg" />
              Arsipkan
            </Button>
          )}
          {canRestoreProject && (
            <Button onClick={onRestoreProject} className="h-9 gap-1.5 text-xs">
              <RotateCcw className="h-3.5 w-3.5" />
              Pulihkan Project
            </Button>
          )}
          {canEditArea && (
            <Button onClick={onAddArea} className="h-9 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Tambah Area
            </Button>
          )}
        </div>
      </div>

      {(isSupervisorReadOnly || isProjectReadOnly) && (
        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface p-3.5 text-xs text-text-secondary">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-text-primary" />
          <span>
            {isSupervisorReadOnly
              ? "Mode baca saja: hanya area yang sedang ditugaskan kepada Anda pada project ini yang ditampilkan (BR-03, BR-09)."
              : "Project ini berada di Archive (selesai atau arsip manual) sehingga seluruh data bersifat baca saja hingga dipulihkan oleh Owner (BR-12, BR-39)."}
          </span>
        </div>
      )}
    </>
  );
}
