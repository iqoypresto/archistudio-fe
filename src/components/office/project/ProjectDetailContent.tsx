"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  useAssignSupervisorMutation, useCreateAreaMutation, useProjectAreasQuery, useUpdateAreaMutation,
} from "@/hooks/area.hooks";
import {
  useArchiveProjectMutation, useCompleteProjectMutation, useProjectDetailQuery,
  useRestoreProjectMutation, useUpdateProjectMutation,
} from "@/hooks/project.hooks";
import { isFieldRole } from "@/lib/utils/role";
import { resolveAreaPermissions } from "@/lib/validation/area-access";
import { resolveProjectArchiveActions } from "@/lib/validation/project.validation";
import { useAuthStore } from "@/stores/auth.store";
import type { AreaListItem } from "@/types/api/area.types";
import { AreaCard } from "./AreaCard";
import { AreaFormModal } from "./AreaFormModal";
import { AssignSupervisorModal } from "./AssignSupervisorModal";
import { AssignmentHistoryDrawer } from "./AssignmentHistoryDrawer";
import { ProjectDetailHeader } from "./ProjectDetailHeader";
import { ProjectFormModal } from "./ProjectFormModal";
import { ProjectLifecycleDialogs } from "./ProjectLifecycleDialogs";
import { SupervisorProjectDetail } from "./SupervisorProjectDetail";

export function ProjectDetailContent({ projectId }: { projectId: string }) {
  const role = useAuthStore((state) => state.user?.role);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [areaToEdit, setAreaToEdit] = useState<AreaListItem | null>(null);
  const [areaToAssign, setAreaToAssign] = useState<AreaListItem | null>(null);
  const [areaForHistory, setAreaForHistory] = useState<AreaListItem | null>(null);
  const [lifecycleModal, setLifecycleModal] = useState<"complete" | "archive" | "restore" | null>(null);

  const projectQuery = useProjectDetailQuery(projectId);
  const areasQuery = useProjectAreasQuery(projectId);
  const project = projectQuery.data;
  const { isSupervisorReadOnly, isProjectReadOnly, canViewHistory, canEditArea } =
    resolveAreaPermissions(role, project);
  const archiveActions = resolveProjectArchiveActions(role, project);

  const updateProject = useUpdateProjectMutation(() => setIsProjectModalOpen(false));
  const createArea = useCreateAreaMutation(projectId, () => setIsAreaModalOpen(false));
  const updateArea = useUpdateAreaMutation(projectId, () => {
    setIsAreaModalOpen(false);
    setAreaToEdit(null);
  });
  const assignSupervisor = useAssignSupervisorMutation(projectId, () => setAreaToAssign(null));
  const completeProject = useCompleteProjectMutation(() => setLifecycleModal(null));
  const archiveProject = useArchiveProjectMutation(() => setLifecycleModal(null));
  const restoreProject = useRestoreProjectMutation(() => setLifecycleModal(null));

  if (isFieldRole(role)) {
    return (
      <SupervisorProjectDetail
        project={project} areas={areasQuery.data}
        isLoading={projectQuery.isLoading || areasQuery.isLoading}
        isError={projectQuery.isError || areasQuery.isError}
        error={projectQuery.error ?? areasQuery.error}
        onRetry={() => { void projectQuery.refetch(); void areasQuery.refetch(); }}
      />
    );
  }

  if (projectQuery.isError) {
    const message = projectQuery.error instanceof Error ? projectQuery.error.message : "Gagal memuat detail project.";
    return (
      <div className="space-y-4">
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary">
          <ArrowLeft className="size-3.5" /> Kembali ke Daftar Project
        </Link>
        <ErrorState description={message} onRetry={() => projectQuery.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ProjectDetailHeader
        project={project}
        canEditProject={canEditArea && Boolean(project)}
        canCompleteProject={archiveActions.canComplete}
        canArchiveProject={archiveActions.canArchive}
        canRestoreProject={archiveActions.canRestore}
        isSupervisorReadOnly={isSupervisorReadOnly}
        isProjectReadOnly={isProjectReadOnly}
        onEditProject={() => setIsProjectModalOpen(true)}
        onCompleteProject={() => setLifecycleModal("complete")}
        onArchiveProject={() => setLifecycleModal("archive")}
        onRestoreProject={() => setLifecycleModal("restore")}
      />

      <section className="rounded-xl border border-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text-primary">Daftar Area &amp; Pengawas Lapangan</h2>
            <span className="text-xs text-text-muted tabular-nums">({areasQuery.data?.length ?? 0})</span>
          </div>
          {canEditArea && (
            <Button
              type="button"
              size="sm"
              onClick={() => { setAreaToEdit(null); setIsAreaModalOpen(true); }}
              className="h-8 gap-1.5 px-3 text-xs"
            >
              <Plus className="size-3.5" /> Tambah Area
            </Button>
          )}
        </div>

        <div className="p-5">
          <AsyncStateView
            isLoading={areasQuery.isLoading}
            isError={areasQuery.isError}
            error={areasQuery.error}
            data={areasQuery.data}
            isEmpty={(areas) => areas.length === 0}
            onRetry={() => areasQuery.refetch()}
            emptyTitle="Project belum memiliki area"
            emptyDescription={
              canEditArea
                ? "Tambahkan area pertama dan tetapkan supervisor aktif untuk memulai pelaporan harian."
                : "Belum ada area aktif yang tersedia untuk ditampilkan."
            }
          >
            {(areas) => (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {areas.map((area) => (
                  <AreaCard
                    key={area.id}
                    area={area}
                    canEditArea={canEditArea}
                    canViewHistory={canViewHistory}
                    onEdit={(item) => { setAreaToEdit(item); setIsAreaModalOpen(true); }}
                    onAssignSupervisor={setAreaToAssign}
                    onViewHistory={setAreaForHistory}
                  />
                ))}
              </div>
            )}
          </AsyncStateView>
        </div>
      </section>

      {canEditArea && project && (
        <>
          <ProjectFormModal
            isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)}
            projectToEdit={project} onSubmitCreate={() => undefined}
            onSubmitUpdate={(id, data) => updateProject.mutate({ id, payload: data })}
            isSubmitting={updateProject.isPending}
          />
          <AreaFormModal
            isOpen={isAreaModalOpen} onClose={() => { setIsAreaModalOpen(false); setAreaToEdit(null); }}
            areaToEdit={areaToEdit} onSubmitCreate={createArea.mutate}
            onSubmitUpdate={(id, data) => updateArea.mutate({ areaId: id, payload: data })}
            isSubmitting={createArea.isPending || updateArea.isPending}
          />
          <AssignSupervisorModal
            isOpen={Boolean(areaToAssign)} onClose={() => setAreaToAssign(null)}
            targetArea={areaToAssign} onSubmit={(id, data) => assignSupervisor.mutate({ areaId: id, payload: data })}
            isSubmitting={assignSupervisor.isPending}
          />
        </>
      )}

      {canViewHistory && (
        <AssignmentHistoryDrawer
          isOpen={Boolean(areaForHistory)}
          onClose={() => setAreaForHistory(null)}
          targetArea={areaForHistory}
        />
      )}

      <ProjectLifecycleDialogs
        project={project ?? null}
        canComplete={archiveActions.canComplete}
        canArchive={archiveActions.canArchive}
        canRestore={archiveActions.canRestore}
        isCompleteOpen={lifecycleModal === "complete"}
        isArchiveOpen={lifecycleModal === "archive"}
        isRestoreOpen={lifecycleModal === "restore"}
        onCloseComplete={() => setLifecycleModal(null)}
        onCloseArchive={() => setLifecycleModal(null)}
        onCloseRestore={() => setLifecycleModal(null)}
        onConfirmComplete={completeProject.mutate}
        onConfirmArchive={archiveProject.mutate}
        onConfirmRestore={(id, payload) => restoreProject.mutate({ id, payload })}
        isCompleting={completeProject.isPending}
        isArchiving={archiveProject.isPending}
        isRestoring={restoreProject.isPending}
      />
    </div>
  );
}
