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
}

export function AreaCard({
  area,
  onEdit,
  onAssignSupervisor,
  onViewHistory,
}: AreaCardProps) {
  const active = area.activeAssignment;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-xs transition-shadow hover:shadow-sm">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 items-center rounded-md bg-primary/10 px-2.5 font-mono text-xs font-bold text-primary">
              {area.code}
            </span>
            <h3 className="font-semibold text-text-primary">{area.name}</h3>
          </div>
          <StatusBadge tone={active ? "success" : "warning"}>
            {active ? "Ada Pengawas" : "Belum Ditugaskan"}
          </StatusBadge>
        </div>

        <div className="rounded-lg bg-surface-subtle p-3 text-xs">
          <span className="font-medium text-text-secondary">Supervisor Lapangan (BR-08):</span>
          {active ? (
            <div className="mt-1 space-y-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                <UserCheck className="h-3.5 w-3.5 text-status-success-fg" />
                {active.supervisor.name}
                <span className="font-normal text-text-secondary">
                  (@{active.supervisor.username})
                </span>
              </div>
              <p className="text-text-secondary">
                {active.supervisor.jobTitle} • {active.supervisor.phone}
              </p>
              <p className="pt-0.5 text-text-tertiary">
                Bertugas sejak: {active.startDate.slice(0, 10)}
              </p>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-1.5 text-status-warning-fg">
              <UserX className="h-3.5 w-3.5" />
              <span>Belum ada supervisor aktif</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="min-h-11 gap-1 px-2.5 text-xs"
            onClick={() => onEdit(area)}
            title="Ubah nama atau kode area"
          >
            <Pencil className="h-3.5 w-3.5" />
            Ubah
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-11 gap-1 px-2.5 text-xs"
            onClick={() => onViewHistory(area)}
            title="Lihat kronologis penugasan"
          >
            <History className="h-3.5 w-3.5" />
            Riwayat
          </Button>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="min-h-11 gap-1.5 px-3 text-xs"
          onClick={() => onAssignSupervisor(area)}
        >
          <UserCheck className="h-3.5 w-3.5" />
          {active ? "Ganti Pengawas" : "Tugaskan"}
        </Button>
      </div>
    </div>
  );
}
