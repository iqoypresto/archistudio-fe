"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Calendar, ExternalLink, Pencil, Plus } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  useCreateCommsMutation,
  useProjectCommsQuery,
  useUpdateCommsMutation,
} from "@/hooks/comms.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import {
  getCommsDirectionLabel,
  resolveCommsPermissions,
} from "@/lib/validation/comms.validation";
import { useAuthStore } from "@/stores/auth.store";
import type { CommsDirection, CommsEntryItem } from "@/types/api/comms.types";
import { CommsFiltersBar } from "./CommsFiltersBar";
import { CommsFormModal } from "./CommsFormModal";

interface CommsContentProps {
  projectId: string;
}

export function CommsContent({ projectId }: CommsContentProps) {
  const role = useAuthStore((state) => state.user?.role);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [direction, setDirection] = useState<CommsDirection | "">("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<CommsEntryItem | null>(null);

  const projectQuery = useProjectDetailQuery(projectId);
  const { canView, canMutate, isProjectReadOnly } = resolveCommsPermissions(
    role,
    projectQuery.data,
  );

  const commsQuery = useProjectCommsQuery(
    projectId,
    {
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      ...(direction && { direction }),
    },
    { enabled: canView },
  );
  const createMutation = useCreateCommsMutation(projectId, () => setIsModalOpen(false));
  const updateMutation = useUpdateCommsMutation(projectId, () => {
    setIsModalOpen(false);
    setEntryToEdit(null);
  });

  if (!canView) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary">
        Modul Comms project hanya dapat diakses oleh Owner (BR-35).
      </div>
    );
  }

  const openCreateModal = () => {
    setEntryToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comms Project"
        description={
          isProjectReadOnly
            ? "Project berada di Archive sehingga catatan Comms bersifat baca saja (BR-12, BR-39)."
            : "Riwayat komunikasi masuk dan keluar project beserta lampiran opsional (khusus Owner — BR-35)."
        }
        action={
          canMutate ? (
            <Button onClick={openCreateModal} className="min-h-11 gap-1.5">
              <Plus className="h-4 w-4" />
              Tambah Catatan
            </Button>
          ) : undefined
        }
      />

      <CommsFiltersBar
        dateFrom={dateFrom}
        dateTo={dateTo}
        direction={direction}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onDirectionChange={setDirection}
        onReset={() => {
          setDateFrom("");
          setDateTo("");
          setDirection("");
        }}
      />

      <AsyncStateView
        isLoading={commsQuery.isLoading}
        isError={commsQuery.isError}
        error={commsQuery.error}
        data={commsQuery.data}
        isEmpty={(items) => items.length === 0}
        onRetry={() => commsQuery.refetch()}
        emptyTitle="Belum ada catatan Comms"
        emptyDescription="Catat komunikasi masuk atau keluar project agar riwayat tersimpan rapi."
        emptyAction={
          canMutate ? (
            <Button onClick={openCreateModal} className="min-h-11 gap-1.5">
              <Plus className="h-4 w-4" />
              Tambah Catatan
            </Button>
          ) : undefined
        }
      >
        {(items) => (
          <div className="space-y-3">
            {items.map((entry) => {
              const isInbound = entry.direction === "INBOUND";
              return (
                <article
                  key={entry.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={isInbound ? "info" : "success"}>
                        <span className="inline-flex items-center gap-1">
                          {isInbound ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {getCommsDirectionLabel(entry.direction)}
                        </span>
                      </StatusBadge>
                      <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                        <Calendar className="h-3.5 w-3.5" /> {entry.entryDate}
                      </span>
                    </div>
                    <h3 className="font-semibold text-text-primary">{entry.subject}</h3>
                    {entry.note && <p className="whitespace-pre-line text-sm text-text-secondary">{entry.note}</p>}
                    {entry.attachmentViewUrl && (
                      <a
                        href={entry.attachmentViewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Lampiran: {entry.attachmentName ?? "File"}
                      </a>
                    )}
                  </div>

                  {canMutate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-11 gap-1.5 self-start"
                      onClick={() => {
                        setEntryToEdit(entry);
                        setIsModalOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Ubah
                    </Button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </AsyncStateView>

      {canMutate && isModalOpen && (
        <CommsFormModal
          key={`${projectId}-${entryToEdit?.id ?? "new"}`}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEntryToEdit(null);
          }}
          projectId={projectId}
          entryToEdit={entryToEdit}
          onSubmitCreate={(payload) => createMutation.mutate(payload)}
          onSubmitUpdate={(commsId, payload) => updateMutation.mutate({ commsId, payload })}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
