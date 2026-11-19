"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  useAssignSupervisorMutation,
  useCreateAreaMutation,
  useProjectAreasQuery,
  useUpdateAreaMutation,
} from "@/hooks/area.hooks";
import {
  useArchiveProjectMutation,
  useCompleteProjectMutation,
  useProjectDetailQuery,
  useRestoreProjectMutation,
} from "@/hooks/project.hooks";
import { resolveAreaPermissions } from "@/lib/validation/area-access";
import { resolveProjectArchiveActions } from "@/lib/validation/project.validation";
import { useAuthStore } from "@/stores/auth.store";
import type { AreaListItem } from "@/types/api/area.types";
import { AreaCard } from "./AreaCard";
import { AreaFormModal } from "./AreaFormModal";
import { AssignSupervisorModal } from "./AssignSupervisorModal";
import { AssignmentHistoryDrawer } from "./AssignmentHistoryDrawer";
import { ProjectDetailHeader } from "./ProjectDetailHeader";
import { ProjectLifecycleDialogs } from "./ProjectLifecycleDialogs";

interface ProjectDetailContentProps {
  projectId: string;
}

export function ProjectDetailContent({ projectId }: ProjectDetailContentProps) {
  const role = useAuthStore((state) => state.user?.role);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [areaToEdit, setAreaToEdit] = useState<AreaListItem | null>(null);
  const [areaToAssign, setAreaToAssign] = useState<AreaListItem | null>(null);
  const [areaForHistory, setAreaForHistory] = useState<AreaListItem | null>(null);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);

  const projectQuery = useProjectDetailQuery(projectId);
  const areasQuery = useProjectAreasQuery(projectId);
  const project = projectQuery.data;
  const { isSupervisorReadOnly, isProjectReadOnly, canViewHistory, canEditArea } =
    resolveAreaPermissions(role, project);
  const archiveActions = resolveProjectArchiveActions(role, project);

  const createArea = useCreateAreaMutation(projectId, () => setIsAreaModalOpen(false));
  const updateArea = useUpdateAreaMutation(projectId, () => {
    setIsAreaModalOpen(false);
    setAreaToEdit(null);
  });
  const assignSupervisor = useAssignSupervisorMutation(projectId, () => setAreaToAssign(null));
  const completeProject = useCompleteProjectMutation(() => setIsCompleteOpen(false));
  const archiveProject = useArchiveProjectMutation(() => setIsArchiveOpen(false));
  const restoreProject = useRestoreProjectMutation(() => setIsRestoreOpen(false));

  if (projectQuery.isError) {
    const message =
      projectQuery.error instanceof Error
        ? projectQuery.error.message
        : "Gagal memuat detail project.";
    return (
      <div className="space-y-4">
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Project
        </Link>
        <ErrorState description={message} onRetry={() => projectQuery.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectDetailHeader
        project={project}
        canEditArea={canEditArea}
        canCompleteProject={archiveActions.canComplete}
        canArchiveProject={archiveActions.canArchive}
        canRestoreProject={archiveActions.canRestore}
        isSupervisorReadOnly={isSupervisorReadOnly}
        isProjectReadOnly={isProjectReadOnly}
        onAddArea={() => {
          setAreaToEdit(null);
          setIsAreaModalOpen(true);
        }}
        onCompleteProject={() => setIsCompleteOpen(true)}
        onArchiveProject={() => setIsArchiveOpen(true)}
        onRestoreProject={() => setIsRestoreOpen(true)}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">
            Daftar Area & Pengawas Lapangan
          </h2>
          <span className="text-xs text-text-secondary">
            {areasQuery.data?.length ?? 0} Area Terdaftar
          </span>
        </div>

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
              ? "Tambahkan area pertama dan tetapkan supervisor aktif untuk memulai pencatatan laporan harian (BR-08)."
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
                  onEdit={(item) => {
                    setAreaToEdit(item);
                    setIsAreaModalOpen(true);
                  }}
                  onAssignSupervisor={(item) => setAreaToAssign(item)}
                  onViewHistory={(item) => setAreaForHistory(item)}
                />
              ))}
            </div>
          )}
        </AsyncStateView>
      </div>

      {canEditArea && (
        <>
          <AreaFormModal
            isOpen={isAreaModalOpen}
            onClose={() => {
              setIsAreaModalOpen(false);
              setAreaToEdit(null);
            }}
            areaToEdit={areaToEdit}
            onSubmitCreate={(data) => createArea.mutate(data)}
            onSubmitUpdate={(id, data) => updateArea.mutate({ areaId: id, payload: data })}
            isSubmitting={createArea.isPending || updateArea.isPending}
          />
          <AssignSupervisorModal
            isOpen={Boolean(areaToAssign)}
            onClose={() => setAreaToAssign(null)}
            targetArea={areaToAssign}
            onSubmit={(id, data) => assignSupervisor.mutate({ areaId: id, payload: data })}
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
        isCompleteOpen={isCompleteOpen}
        isArchiveOpen={isArchiveOpen}
        isRestoreOpen={isRestoreOpen}
        onCloseComplete={() => setIsCompleteOpen(false)}
        onCloseArchive={() => setIsArchiveOpen(false)}
        onCloseRestore={() => setIsRestoreOpen(false)}
        onConfirmComplete={(id) => completeProject.mutate(id)}
        onConfirmArchive={(id) => archiveProject.mutate(id)}
        onConfirmRestore={(id, payload) => restoreProject.mutate({ id, payload })}
        isCompleting={completeProject.isPending}
        isArchiving={archiveProject.isPending}
        isRestoring={restoreProject.isPending}
      />
    </div>
  );
}
