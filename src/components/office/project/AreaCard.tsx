"use client";

import { History, Pencil, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { AreaListItem } from "@/types/api/area.types";

interface AreaCardProps {
  area: AreaListItem;
  onEdit: (area: AreaListItem) => void;
  onAssignSupervisor: (area: AreaListItem) => void;
  onViewHistory: (area: AreaListItem) => void;
  canEditArea: boolean;
  canViewHistory: boolean;
}

export function AreaCard({
  area,
  onEdit,
  onAssignSupervisor,
  onViewHistory,
  canEditArea,
  canViewHistory,
}: AreaCardProps) {
  const active = area.activeAssignment;
  const showFooter = canEditArea || canViewHistory;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-surface-input/70 p-4 transition-colors hover:border-white/[0.14]">
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-11 w-14 items-center justify-center rounded-lg border border-border bg-surface font-mono text-xs font-semibold tracking-wider text-text-primary">
            {area.code}
          </div>
          <StatusBadge tone={active ? "success" : "warning"}>
            {active ? "Ada Pengawas" : "Belum Ditugaskan"}
          </StatusBadge>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-medium tracking-tight text-text-primary">{area.name}</h3>
          {active ? (
            <div className="space-y-0.5 text-xs leading-relaxed text-text-secondary">
              <p className="flex items-center gap-1.5 font-medium text-text-primary">
                <UserCheck className="h-3.5 w-3.5 text-status-success-fg" />
                <span className="truncate">{active.supervisor.name}</span>
                <span className="text-text-muted">(@{active.supervisor.username})</span>
              </p>
              <p className="truncate text-[11px] text-text-muted">
                {active.supervisor.jobTitle} • Sejak {active.startDate.slice(0, 10)}
              </p>
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-status-warning-fg">
              <UserX className="h-3.5 w-3.5" />
              <span>Belum ada supervisor aktif (BR-08 / BR-09)</span>
            </p>
          )}
        </div>
      </div>

      {showFooter && (
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
          {canEditArea ? (
            <Button
              size="sm"
              variant="secondary"
              className="h-8 flex-1 gap-1.5 rounded-lg bg-surface-active text-xs text-text-primary hover:bg-primary-hover"
              onClick={() => onAssignSupervisor(area)}
            >
              <UserCheck className="h-3.5 w-3.5" />
              {active ? "Ganti Pengawas" : "Tugaskan"}
            </Button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1">
            {canViewHistory && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-xs text-text-secondary hover:text-text-primary"
                onClick={() => onViewHistory(area)}
                title="Lihat kronologis penugasan"
              >
                <History className="h-3.5 w-3.5" />
                Riwayat
              </Button>
            )}
            {canEditArea && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-xs text-text-secondary hover:text-text-primary"
                onClick={() => onEdit(area)}
                title="Ubah nama atau kode area"
              >
                <Pencil className="h-3.5 w-3.5" />
                Ubah
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
