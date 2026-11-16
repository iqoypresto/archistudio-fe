"use client";

import { History } from "lucide-react";
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
  const { data: history = [], isLoading } = useAreaAssignmentsQuery(
    isOpen && targetArea ? targetArea.id : null,
  );

  if (!targetArea) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Riwayat Penugasan Area {targetArea.code}
          </DialogTitle>
          <DialogDescription>
            Kronologis pergantian pengawas lapangan pada area <strong>{targetArea.name}</strong> (BR-10).
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-text-secondary">
              Memuat riwayat penugasan...
            </div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-secondary">
              Belum ada data penugasan untuk area ini.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, idx) => {
                const isActive = !item.endDate;
                return (
                  <div
                    key={item.id}
                    className={`relative rounded-lg border p-3 text-sm transition-colors ${
                      isActive
                        ? "border-primary/40 bg-primary/5"
                        : "border-border bg-surface"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
