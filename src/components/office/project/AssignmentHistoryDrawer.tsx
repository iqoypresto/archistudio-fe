"use client";

import { History } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAreaAssignmentsQuery } from "@/hooks/area.hooks";
import type { AreaListItem } from "@/types/api/area.types";

interface AssignmentHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetArea: AreaListItem | null;
}

export function AssignmentHistoryDrawer({
  isOpen,
  onClose,
  targetArea,
}: AssignmentHistoryDrawerProps) {
  const historyQuery = useAreaAssignmentsQuery(
    isOpen && targetArea ? targetArea.id : null,
  );

  if (!targetArea) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-text-secondary" />
            Riwayat Penugasan Area {targetArea.code}
          </DialogTitle>
          <DialogDescription>
            Kronologis pergantian pengawas lapangan pada area <strong>{targetArea.name}</strong>{" "}
            (BR-10).
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <AsyncStateView
            isLoading={historyQuery.isLoading}
            isError={historyQuery.isError}
            error={historyQuery.error}
            data={historyQuery.data}
            isEmpty={(items) => items.length === 0}
            onRetry={() => historyQuery.refetch()}
            emptyTitle="Belum ada riwayat penugasan"
            emptyDescription="Area ini belum memiliki catatan penugasan supervisor."
          >
            {(history) => (
              <div className="space-y-3">
                {history.map((item) => {
                  const isActive = !item.endDate;
                  return (
                    <div
                      key={item.id}
                      className={`relative rounded-xl border p-3.5 text-sm transition-colors ${
                        isActive
                          ? "border-white/20 bg-surface-active"
                          : "border-border bg-surface-input/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-primary">
                              {item.supervisor.name}
                            </span>
                            <span className="text-xs text-text-secondary">
                              @{item.supervisor.username}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary">
                            {item.supervisor.jobTitle} • {item.supervisor.phone}
                          </p>
                        </div>
                        <StatusBadge tone={isActive ? "success" : "muted"}>
                          {isActive ? "Aktif" : "Selesai"}
                        </StatusBadge>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center justify-between border-t border-border/60 pt-2 text-xs text-text-secondary">
                        <span>
                          Periode: <strong>{item.startDate.slice(0, 10)}</strong> s/d{" "}
                          <strong>{item.endDate ? item.endDate.slice(0, 10) : "Sekarang"}</strong>
                        </span>
                        <span>Oleh: {item.assignedBy.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AsyncStateView>
        </div>
      </DialogContent>
    </Dialog>
  );
}
