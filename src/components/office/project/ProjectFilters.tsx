"use client";

import { FolderPlus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectFilterParams, ProjectStatus } from "@/types/api/project.types";

interface ProjectFiltersProps {
  filters: ProjectFilterParams;
  onFilterChange: (updates: Partial<ProjectFilterParams>) => void;
  onReset: () => void;
  onOpenCreateModal: () => void;
  canManage: boolean;
}

export function ProjectFilters({
  filters,
  onFilterChange,
  onReset,
  onOpenCreateModal,
  canManage,
}: ProjectFiltersProps) {
  const hasActiveFilters = Boolean(filters.search || filters.status);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={filters.search ?? ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            placeholder="Cari nama, kode, client, lokasi..."
            className="pl-9"
          />
        </div>

        <select
          value={filters.status ?? ""}
          onChange={(e) =>
            onFilterChange({
              status: (e.target.value || undefined) as ProjectStatus | undefined,
              page: 1,
            })
          }
          className="border-border bg-surface text-text-primary focus:ring-primary h-9 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
          aria-label="Filter Status Project"
        >
          <option value="">Semua Status</option>
          <option value="PERSIAPAN">Persiapan</option>
          <option value="BERJALAN">Berjalan</option>
          <option value="SELESAI">Selesai</option>
        </select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 px-2 text-xs"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      {canManage && (
        <Button onClick={onOpenCreateModal} className="h-9 gap-1.5 self-start sm:self-auto">
          <FolderPlus className="h-4 w-4" />
          Tambah Project
        </Button>
      )}
    </div>
  );
}
