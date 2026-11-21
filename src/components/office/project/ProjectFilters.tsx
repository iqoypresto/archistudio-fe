"use client";

import { FolderPlus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActiveProjectStatus, ProjectFilterParams } from "@/types/api/project.types";

interface ProjectFiltersProps {
  filters: ProjectFilterParams;
  onFilterChange: (updates: Partial<ProjectFilterParams>) => void;
  onReset: () => void;
  onOpenCreateModal: () => void;
  canManage: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  ALL: "Semua Status Aktif",
  PERSIAPAN: "Persiapan",
  BERJALAN: "Berjalan",
};

export function ProjectFilters({
  filters,
  onFilterChange,
  onReset,
  onOpenCreateModal,
  canManage,
}: ProjectFiltersProps) {
  const hasActiveFilters = Boolean(filters.search || filters.status);
  const statusValue = filters.status ?? "ALL";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-input/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={filters.search ?? ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            placeholder="Cari nama, kode, client, lokasi..."
            className="h-8 pl-9 text-xs"
          />
        </div>

        <div className="w-48">
          <Select
            value={statusValue}
            onValueChange={(val: string | null) =>
              onFilterChange({
                status: (!val || val === "ALL" ? undefined : val) as ActiveProjectStatus | undefined,
                page: 1,
              })
            }
          >
            <SelectTrigger aria-label="Filter Status Project" className="h-8 text-xs">
              <SelectValue placeholder="Semua Status Aktif">
                {STATUS_LABELS[statusValue]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status Aktif</SelectItem>
              <SelectItem value="PERSIAPAN">Persiapan</SelectItem>
              <SelectItem value="BERJALAN">Berjalan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 px-2.5 text-xs"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      {canManage && (
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCreateModal}
          className="h-8 gap-1.5 self-start border-border bg-surface text-xs sm:hidden"
        >
          <FolderPlus className="h-3.5 w-3.5" />
          Tambah Project
        </Button>
      )}
    </div>
  );
}
