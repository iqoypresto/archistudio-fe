"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useCreateCommsMutation, useProjectCommsQuery, useUpdateCommsMutation } from "@/hooks/comms.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { isFieldRole } from "@/lib/utils/role";
import { canEditCommsEntry, resolveCommsPermissions } from "@/lib/validation/comms.validation";
import { useAuthStore } from "@/stores/auth.store";
import type { CommsDirection, CommsEntryItem } from "@/types/api/comms.types";
import type { ApiSurface } from "@/lib/api/api-surface";
import { CommsEntryRow } from "./CommsEntryRow";
import { CommsFiltersBar } from "./CommsFiltersBar";
import { CommsFormModal } from "./CommsFormModal";

export function CommsContent({ projectId, fixedDirection, surface = "office" }: { projectId: string; fixedDirection?: CommsDirection; surface?: ApiSurface }) {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [direction, setDirection] = useState<CommsDirection | "">("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<CommsEntryItem | null>(null);

  const project = useProjectDetailQuery(projectId, surface).data;
  const { canView, canMutate, isProjectReadOnly } = resolveCommsPermissions(role, project);
  const effectiveDirection = fixedDirection ?? direction;
  const fieldTouch = isFieldRole(role);

  const commsQuery = useProjectCommsQuery(
    projectId,
    {
      ...(search.trim() && { search: search.trim() }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      ...(effectiveDirection && { direction: effectiveDirection }),
    },
    { enabled: canView },
    surface,
  );
  const createMutation = useCreateCommsMutation(projectId, () => setIsModalOpen(false), surface);
  const updateMutation = useUpdateCommsMutation(projectId, () => {
    setIsModalOpen(false);
    setEntryToEdit(null);
  }, surface);

  if (!canView) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary">
        Anda tidak memiliki akses ke modul komunikasi proyek ini.
      </div>
    );
  }

  const pageTitle = fixedDirection === "INBOUND" ? "Comms In" : fixedDirection === "OUTBOUND" ? "Comms Out" : "Comms Project";
  const pageDescription = isProjectReadOnly
    ? "Proyek berada di Archive sehingga catatan komunikasi bersifat baca saja."
    : fixedDirection === "INBOUND"
      ? "Catatan komunikasi masuk proyek beserta lampiran file pendukung."
      : fixedDirection === "OUTBOUND"
        ? "Catatan komunikasi keluar proyek beserta lampiran file pendukung."
        : "Catatan komunikasi masuk dan keluar proyek beserta lampiran pendukung.";

  const openCreateModal = () => {
    setEntryToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        kicker={project ? `${project.code} · ${project.name}` : undefined}
        title={pageTitle}
        description={pageDescription}
        action={
          canMutate ? (
            <Button
              type="button"
              onClick={openCreateModal}
              className={fieldTouch ? "min-h-12 gap-1.5 px-4 text-sm" : "h-9 gap-1.5 text-xs"}
            >
              <Plus className="size-3.5" />
              Tambah Catatan
            </Button>
          ) : undefined
        }
      />

      <section className="overflow-hidden rounded-xl border border-border bg-surface tabular-nums">
        <div className="border-b border-border p-4 sm:px-5">
          <CommsFiltersBar
            search={search}
            dateFrom={dateFrom}
            dateTo={dateTo}
            direction={effectiveDirection}
            hideDirectionFilter={Boolean(fixedDirection)}
            onSearchChange={setSearch}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onDirectionChange={setDirection}
            onReset={() => {
              setSearch("");
              setDateFrom("");
              setDateTo("");
              setDirection("");
            }}
          />
        </div>

        <AsyncStateView
          isLoading={commsQuery.isLoading}
          isError={commsQuery.isError}
          error={commsQuery.error}
          data={commsQuery.data}
          isEmpty={(items) => items.length === 0}
          onRetry={() => commsQuery.refetch()}
          emptyTitle={`Belum ada catatan ${pageTitle}`}
          emptyDescription="Catat komunikasi proyek agar riwayat tersimpan rapi."
          emptyAction={
            canMutate ? (
              <Button type="button" onClick={openCreateModal} className="h-9 gap-1.5 text-xs">
                <Plus className="size-3.5" />
                Tambah Catatan
              </Button>
            ) : undefined
          }
        >
          {(items) => (
            <div className="divide-y divide-border/80">
              {items.map((entry) => (
                <CommsEntryRow
                  key={entry.id}
                  entry={entry}
                  showDirection={!fixedDirection}
                  canEdit={canMutate && canEditCommsEntry(user, entry)}
                  onEdit={(target) => {
                    setEntryToEdit(target);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </AsyncStateView>
      </section>

      {canMutate && isModalOpen && (
        <CommsFormModal
          key={`${projectId}-${fixedDirection ?? "all"}-${entryToEdit?.id ?? "new"}`}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEntryToEdit(null);
          }}
          projectId={projectId}
          surface={surface}
          fixedDirection={fixedDirection}
          entryToEdit={entryToEdit}
          onSubmitCreate={(payload) => createMutation.mutate(payload)}
          onSubmitUpdate={(commsId, payload) => updateMutation.mutate({ commsId, payload })}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
