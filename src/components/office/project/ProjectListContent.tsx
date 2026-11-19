"use client";

import { useState } from "react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import {
  useArchiveProjectMutation,
  useCreateProjectMutation,
  useProjectsQuery,
  useUpdateProjectMutation,
} from "@/hooks/project.hooks";
import type { ProjectFilterParams, ProjectListItem } from "@/types/api/project.types";
import { useAuthStore } from "@/stores/auth.store";
import { ConfirmArchiveProjectDialog } from "./ConfirmArchiveProjectDialog";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectFormModal } from "./ProjectFormModal";
import { ProjectTable } from "./ProjectTable";

export function ProjectListContent() {
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === "OWNER" || role === "ADMIN";
  const canArchive = role === "OWNER";
  const [filters, setFilters] = useState<ProjectFilterParams>({
    page: 1,
    pageSize: 10,
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ProjectListItem | null>(null);
  const [projectToArchive, setProjectToArchive] = useState<ProjectListItem | null>(null);

  const projectsQuery = useProjectsQuery(filters);

  const createMutation = useCreateProjectMutation(() => setIsFormModalOpen(false));
  const updateMutation = useUpdateProjectMutation(() => {
    setIsFormModalOpen(false);
    setProjectToEdit(null);
  });
  const archiveMutation = useArchiveProjectMutation(() => setProjectToArchive(null));

  const handleFilterChange = (updates: Partial<ProjectFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 10 });
  };

  const handleOpenEdit = (project: ProjectListItem) => {
    setProjectToEdit(project);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <ProjectFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onOpenCreateModal={() => {
          setProjectToEdit(null);
          setIsFormModalOpen(true);
        }}
        canManage={canManage}
      />

      <AsyncStateView
        isLoading={projectsQuery.isLoading}
        isError={projectsQuery.isError}
        error={projectsQuery.error}
        data={projectsQuery.data}
        onRetry={() => projectsQuery.refetch()}
        emptyTitle="Belum ada project"
        emptyDescription="Tidak ada data project yang sesuai dengan kriteria filter."
      >
        {(result) => (
          <ProjectTable
            projects={result.data}
            meta={result.meta}
            canManage={canManage}
            canArchive={canArchive}
            onPageChange={(page) => handleFilterChange({ page })}
            onEdit={handleOpenEdit}
            onArchive={(project) => setProjectToArchive(project)}
          />
        )}
      </AsyncStateView>

      {canManage && <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setProjectToEdit(null);
        }}
        projectToEdit={projectToEdit}
        onSubmitCreate={(data) => createMutation.mutate(data)}
        onSubmitUpdate={(id, data) => updateMutation.mutate({ id, payload: data })}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />}

      {canArchive && <ConfirmArchiveProjectDialog
        isOpen={Boolean(projectToArchive)}
        onClose={() => setProjectToArchive(null)}
        targetProject={projectToArchive}
        onConfirm={(projectId) => archiveMutation.mutate(projectId)}
        isSubmitting={archiveMutation.isPending}
      />}
    </div>
  );
}
