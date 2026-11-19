"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  useAssignSupervisorMutation,
  useCreateAreaMutation,
  useProjectAreasQuery,
  useUpdateAreaMutation,
} from "@/hooks/area.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import type { AreaListItem } from "@/types/api/area.types";
import { useAuthStore } from "@/stores/auth.store";
import { AreaCard } from "./AreaCard";
import { AreaFormModal } from "./AreaFormModal";
import { AssignSupervisorModal } from "./AssignSupervisorModal";
import { AssignmentHistoryDrawer } from "./AssignmentHistoryDrawer";

interface ProjectDetailContentProps {
  projectId: string;
}

export function ProjectDetailContent({ projectId }: ProjectDetailContentProps) {
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === "OWNER" || role === "ADMIN";
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [areaToEdit, setAreaToEdit] = useState<AreaListItem | null>(null);
  const [areaToAssign, setAreaToAssign] = useState<AreaListItem | null>(null);
  const [areaForHistory, setAreaForHistory] = useState<AreaListItem | null>(null);

  const projectQuery = useProjectDetailQuery(projectId);
  const areasQuery = useProjectAreasQuery(projectId);

  const createAreaMutation = useCreateAreaMutation(projectId, () =>
    setIsAreaModalOpen(false),
  );
  const updateAreaMutation = useUpdateAreaMutation(projectId, () => {
    setIsAreaModalOpen(false);
    setAreaToEdit(null);
  });
  const assignSupervisorMutation = useAssignSupervisorMutation(projectId, () =>
    setAreaToAssign(null),
  );

  const project = projectQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            title="Kembali ke Daftar Project"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary">
                {project?.code ?? "..."}
              </span>
              <h1 className="text-xl font-bold tracking-tight text-text-primary">
                {project?.name ?? "Memuat Project..."}
              </h1>
              {project && (
                <StatusBadge
                  tone={
                    project.status === "BERJALAN"
                      ? "info"
                      : project.status === "SELESAI"
                        ? "success"
                        : "muted"
                  }
                >
                  {project.status}
                </StatusBadge>
              )}
            </div>
            {project && (
              <p className="flex items-center gap-3 text-xs text-text-secondary">
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

        {canManage && <Button
          onClick={() => {
            setAreaToEdit(null);
            setIsAreaModalOpen(true);
          }}
          className="h-9 gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Area
        </Button>}
      </div>

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
          onRetry={() => areasQuery.refetch()}
          emptyTitle="Project belum memiliki area"
          emptyDescription="Tambahkan area pertama dan tetapkan supervisor aktif untuk memulai pencatatan laporan harian (BR-08)."
        >
          {(areas) => (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {areas.map((area) => (
                <AreaCard
                  key={area.id}
                  area={area}
                  canManage={canManage}
                  onEdit={(a) => {
                    setAreaToEdit(a);
                    setIsAreaModalOpen(true);
                  }}
                  onAssignSupervisor={(a) => setAreaToAssign(a)}
                  onViewHistory={(a) => setAreaForHistory(a)}
                />
              ))}
            </div>
          )}
        </AsyncStateView>
      </div>

      <AreaFormModal
        isOpen={isAreaModalOpen}
        onClose={() => {
          setIsAreaModalOpen(false);
          setAreaToEdit(null);
        }}
        areaToEdit={areaToEdit}
        onSubmitCreate={(data) => createAreaMutation.mutate(data)}
        onSubmitUpdate={(id, data) => updateAreaMutation.mutate({ areaId: id, payload: data })}
        isSubmitting={createAreaMutation.isPending || updateAreaMutation.isPending}
      />

      <AssignSupervisorModal
        isOpen={Boolean(areaToAssign)}
        onClose={() => setAreaToAssign(null)}
        targetArea={areaToAssign}
        onSubmit={(id, data) =>
          assignSupervisorMutation.mutate({ areaId: id, payload: data })
        }
        isSubmitting={assignSupervisorMutation.isPending}
      />

      <AssignmentHistoryDrawer
        isOpen={Boolean(areaForHistory)}
        onClose={() => setAreaForHistory(null)}
        targetArea={areaForHistory}
      />
    </div>
  );
}
