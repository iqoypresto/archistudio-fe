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
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            title={isProjectReadOnly ? "Kembali ke Archive Project" : "Kembali ke Daftar Project"}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary">
                {project?.code ?? "..."}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-text-primary">
                {project?.name ?? "Memuat Project..."}
              </h1>
              {project && (
                <StatusBadge tone={getStatusTone(project.status)}>{project.status}</StatusBadge>
              )}
              {project?.archivedAt && <StatusBadge tone="warning">Arsip Manual</StatusBadge>}
            </div>
            {project && (
              <p className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3 w-3" /> Client: {project.clientName}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Lokasi: {project.location}
                </span>
                <span>Zona: {project.timezone}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canCompleteProject && (
            <Button variant="outline" onClick={onCompleteProject} className="min-h-11 gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-status-success-fg" />
              Tandai Selesai
            </Button>
          )}
          {canArchiveProject && (
            <Button variant="outline" onClick={onArchiveProject} className="min-h-11 gap-1.5">
              <Archive className="h-4 w-4 text-status-warning-fg" />
              Arsipkan
            </Button>
          )}
          {canRestoreProject && (
            <Button onClick={onRestoreProject} className="min-h-11 gap-1.5">
              <RotateCcw className="h-4 w-4" />
              Pulihkan Project
            </Button>
          )}
          {canEditArea && (
            <Button onClick={onAddArea} className="min-h-11 gap-1.5">
              <Plus className="h-4 w-4" />
              Tambah Area
            </Button>
          )}
        </div>
      </div>

      {(isSupervisorReadOnly || isProjectReadOnly) && (
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-subtle p-3 text-xs text-text-secondary">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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
