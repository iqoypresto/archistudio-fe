"use client";

import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { formatIdDate } from "@/lib/utils/office-format";
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
    <div className="flex flex-col justify-between rounded-xl border border-border bg-surface-input/40 p-4 tabular-nums transition-colors hover:border-white/15">
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-text-muted">{area.code}</p>
            <h3 className="mt-0.5 truncate text-sm font-semibold text-text-primary">
              {area.name}
            </h3>
          </div>
          <StatusIndicator tone={active ? "success" : "warning"} className="shrink-0 text-xs">
            {active ? "Aktif" : "Belum ditugaskan"}
          </StatusIndicator>
        </div>

        <div className="border-t border-border/70 pt-3">
          <p className="text-[11px] font-medium tracking-wider text-text-muted uppercase">
            Pengawas Aktif
          </p>
          {active ? (
            <div className="mt-1 space-y-0.5">
              <p className="truncate text-[13px] font-medium text-text-primary">
                {active.supervisor.name}{" "}
                <span className="font-normal text-text-muted">@{active.supervisor.username}</span>
              </p>
              <p className="truncate text-xs text-text-secondary">
                {active.supervisor.jobTitle} · Sejak {formatIdDate(active.startDate)}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-xs text-status-warning-fg">
              Belum ada supervisor aktif yang ditugaskan.
            </p>
          )}
        </div>
      </div>

      {showFooter && (
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
          {canEditArea ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 flex-1 text-xs text-text-primary"
              onClick={() => onAssignSupervisor(area)}
            >
              {active ? "Ganti Pengawas" : "Tugaskan Pengawas"}
            </Button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1">
            {canViewHistory && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-text-secondary hover:text-text-primary"
                onClick={() => onViewHistory(area)}
              >
                Riwayat
              </Button>
            )}
            {canEditArea && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-text-secondary hover:text-text-primary"
                onClick={() => onEdit(area)}
              >
                Ubah
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
