"use client";

import { AsyncStateView } from "@/components/ui/AsyncStateView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { useAreaAssignmentsQuery } from "@/hooks/area.hooks";
import { formatIdDate } from "@/lib/utils/office-format";
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
  const historyQuery = useAreaAssignmentsQuery(isOpen && targetArea ? targetArea.id : null);

  if (!targetArea) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Riwayat Penugasan Area {targetArea.code}</DialogTitle>
          <DialogDescription className="text-xs">
            Kronologis pengawas lapangan pada area {targetArea.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-1 tabular-nums">
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
              <ol className="relative space-y-4 border-l border-border pl-5">
                {history.map((item) => {
                  const isActive = !item.endDate;
                  return (
                    <li key={item.id} className="relative space-y-1">
                      <span
                        aria-hidden="true"
                        className={`absolute top-1.5 -left-[25px] size-2 rounded-full ${
                          isActive ? "bg-status-success-fg" : "bg-text-muted"
                        }`}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-text-primary">
                          {item.supervisor.name}{" "}
                          <span className="font-normal text-text-muted">
                            @{item.supervisor.username}
                          </span>
                        </p>
                        <StatusIndicator
                          tone={isActive ? "success" : "muted"}
                          className="text-xs"
                        >
                          {isActive ? "Aktif" : "Selesai"}
                        </StatusIndicator>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {item.supervisor.jobTitle} · {item.supervisor.phone}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatIdDate(item.startDate)} —{" "}
                        {item.endDate ? formatIdDate(item.endDate) : "Sekarang"} · Ditetapkan oleh{" "}
                        {item.assignedBy.name}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </AsyncStateView>
        </div>
      </DialogContent>
    </Dialog>
  );
}
