"use client";

import type { ProjectDetail, RestoreProjectPayload } from "@/types/api/project.types";
import { ConfirmArchiveProjectDialog } from "./ConfirmArchiveProjectDialog";
import { ConfirmCompleteProjectDialog } from "./ConfirmCompleteProjectDialog";
import { RestoreProjectDialog } from "./RestoreProjectDialog";

interface ProjectLifecycleDialogsProps {
  project: ProjectDetail | null;
  canComplete: boolean;
  canArchive: boolean;
  canRestore: boolean;
  isCompleteOpen: boolean;
  isArchiveOpen: boolean;
  isRestoreOpen: boolean;
  onCloseComplete: () => void;
  onCloseArchive: () => void;
  onCloseRestore: () => void;
  onConfirmComplete: (id: string) => void;
  onConfirmArchive: (id: string) => void;
  onConfirmRestore: (id: string, payload: RestoreProjectPayload) => void;
  isCompleting: boolean;
  isArchiving: boolean;
  isRestoring: boolean;
}

export function ProjectLifecycleDialogs({
  project,
  canComplete,
  canArchive,
  canRestore,
  isCompleteOpen,
  isArchiveOpen,
  isRestoreOpen,
  onCloseComplete,
  onCloseArchive,
  onCloseRestore,
  onConfirmComplete,
  onConfirmArchive,
  onConfirmRestore,
  isCompleting,
  isArchiving,
  isRestoring,
}: ProjectLifecycleDialogsProps) {
  return (
    <>
      {canComplete && (
        <ConfirmCompleteProjectDialog
          isOpen={isCompleteOpen}
          onClose={onCloseComplete}
          targetProject={project}
          onConfirm={onConfirmComplete}
          isSubmitting={isCompleting}
        />
      )}
      {canArchive && (
        <ConfirmArchiveProjectDialog
          isOpen={isArchiveOpen}
          onClose={onCloseArchive}
          targetProject={project}
          onConfirm={onConfirmArchive}
          isSubmitting={isArchiving}
        />
      )}
      {canRestore && (
        <RestoreProjectDialog
          isOpen={isRestoreOpen}
          onClose={onCloseRestore}
          targetProject={project}
          onConfirm={onConfirmRestore}
          isSubmitting={isRestoring}
        />
      )}
    </>
  );
}
