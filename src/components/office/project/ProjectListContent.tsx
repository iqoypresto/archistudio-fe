"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { getOfficeProjectDetailHref } from "@/components/layout/floating-add-project.helpers";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageInfoDialog } from "@/components/ui/PageInfoDialog";
import { UnderlineTabsBar } from "@/components/ui/UnderlineTabsNav";
import {
  useArchiveProjectMutation,
  useCreateProjectMutation,
  useProjectsQuery,
  useUpdateProjectMutation,
} from "@/hooks/project.hooks";
import { useAuthStore } from "@/stores/auth.store";
import type {
  ActiveProjectStatus,
  ProjectFilterParams,
  ProjectListItem,
} from "@/types/api/project.types";
import { ConfirmArchiveProjectDialog } from "./ConfirmArchiveProjectDialog";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectFormModal } from "./ProjectFormModal";
import { ProjectTable } from "./ProjectTable";

type ProjectStatusTab = "ALL" | ActiveProjectStatus;

const STATUS_TABS: readonly { value: ProjectStatusTab; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "BERJALAN", label: "Berjalan" },
  { value: "PERSIAPAN", label: "Persiapan" },
];

export function ProjectListContent() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === "OWNER" || role === "ADMIN";
  const canArchive = role === "OWNER";
  const [filters, setFilters] = useState<ProjectFilterParams>({
    page: 1,
    pageSize: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ProjectListItem | null>(null);
  const [projectToArchive, setProjectToArchive] = useState<ProjectListItem | null>(null);

  const projectsQuery = useProjectsQuery(filters);
  const createMutation = useCreateProjectMutation((createdProject) => {
    setIsFormModalOpen(false);
    router.push(getOfficeProjectDetailHref(createdProject.id));
  });
  const updateMutation = useUpdateProjectMutation(() => {
    setIsFormModalOpen(false);
    setProjectToEdit(null);
  });
  const archiveMutation = useArchiveProjectMutation(() => setProjectToArchive(null));

  const handleFilterChange = (updates: Partial<ProjectFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const activeTab: ProjectStatusTab = filters.status ?? "ALL";
  const statusCounts = projectsQuery.data?.statusCounts;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Semua Project"
        titleSuffix={
          <PageInfoDialog
            title="Tentang Semua Project"
            description="Kelola proyek aktif, tim penanggung jawab, jadwal pelaksanaan, zona waktu, dan area lapangan."
          />
        }
        action={
          canManage ? (
            <Button
              type="button"
              onClick={() => {
                setProjectToEdit(null);
                setIsFormModalOpen(true);
              }}
              className="h-9 gap-1.5 text-xs"
            >
              <FolderPlus className="size-3.5" />
              Tambah Project
            </Button>
          ) : undefined
        }
      />

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <UnderlineTabsBar
          ariaLabel="Filter status proyek aktif"
          activeValue={activeTab}
          onChange={(tab) =>
            handleFilterChange({
              status: tab === "ALL" ? undefined : tab,
              page: 1,
            })
          }
          items={STATUS_TABS.map((t) => ({
            ...t,
            count: statusCounts
              ? t.value === "ALL"
                ? statusCounts.all
                : statusCounts[t.value]
              : t.value === activeTab
                ? projectsQuery.data?.meta.totalItems
                : undefined,
          }))}
          rightSlot={
            <span>
              Proyek selesai &amp; arsip tersedia di{" "}
              <Link href="/office/archive" className="text-text-secondary underline-offset-4 hover:underline">
                Archive Project
              </Link>
            </span>
          }
        />

        <div className="p-4 sm:px-5">
          <ProjectFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={() =>
              setFilters({ page: 1, pageSize: 10, sortBy: "createdAt", sortOrder: "desc" })
            }
          />
        </div>

        <AsyncStateView
          isLoading={projectsQuery.isLoading}
          isError={projectsQuery.isError}
          error={projectsQuery.error}
          data={projectsQuery.data}
          isEmpty={(res) => res.data.length === 0}
          onRetry={() => projectsQuery.refetch()}
          emptyTitle="Belum ada proyek"
          emptyDescription="Tidak ada data proyek aktif yang sesuai dengan kriteria pencarian."
        >
          {(result) => (
            <ProjectTable
              projects={result.data}
              meta={result.meta}
              canManage={canManage}
              canArchive={canArchive}
              onPageChange={(page) => handleFilterChange({ page })}
              onEdit={(project) => {
                setProjectToEdit(project);
                setIsFormModalOpen(true);
              }}
              onArchive={(project) => setProjectToArchive(project)}
            />
          )}
        </AsyncStateView>
      </section>

      {canManage && (
        <ProjectFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setProjectToEdit(null);
          }}
          projectToEdit={projectToEdit}
          onSubmitCreate={(data) => createMutation.mutate(data)}
          onSubmitUpdate={(id, data) => updateMutation.mutate({ id, payload: data })}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {canArchive && (
        <ConfirmArchiveProjectDialog
          isOpen={Boolean(projectToArchive)}
          onClose={() => setProjectToArchive(null)}
          targetProject={projectToArchive}
          onConfirm={(projectId) => archiveMutation.mutate(projectId)}
          isSubmitting={archiveMutation.isPending}
        />
      )}
    </div>
  );
}
