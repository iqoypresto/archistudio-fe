"use client";

import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectFilterParams } from "@/types/api/project.types";

type ProjectSortPreset = "createdAt_desc" | "name_asc" | "code_asc" | "startDate_desc";

const SORT_LABELS: Record<ProjectSortPreset, string> = {
  createdAt_desc: "Terbaru ditambahkan",
  name_asc: "Nama A–Z",
  code_asc: "Kode A–Z",
  startDate_desc: "Tanggal mulai terbaru",
};

interface ProjectFiltersProps {
  filters: ProjectFilterParams;
  onFilterChange: (updates: Partial<ProjectFilterParams>) => void;
  onReset: () => void;
}

export function ProjectFilters({ filters, onFilterChange, onReset }: ProjectFiltersProps) {
  const hasActiveFilters = Boolean(filters.search || filters.status);
  const sortPreset: ProjectSortPreset =
    filters.sortBy === "name"
      ? "name_asc"
      : filters.sortBy === "code"
        ? "code_asc"
        : filters.sortBy === "startDate"
          ? "startDate_desc"
          : "createdAt_desc";

  const handleSortChange = (val: string | null) => {
    if (val === "name_asc") {
      onFilterChange({ sortBy: "name", sortOrder: "asc", page: 1 });
    } else if (val === "code_asc") {
      onFilterChange({ sortBy: "code", sortOrder: "asc", page: 1 });
    } else if (val === "startDate_desc") {
      onFilterChange({ sortBy: "startDate", sortOrder: "desc", page: 1 });
    } else {
      onFilterChange({ sortBy: "createdAt", sortOrder: "desc", page: 1 });
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
        <Input
          value={filters.search ?? ""}
          onChange={(e) => onFilterChange({ search: e.target.value || undefined, page: 1 })}
          placeholder="Cari kode, nama proyek, klien, atau lokasi..."
          className="h-9 pl-8 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="w-48">
          <Select value={sortPreset} onValueChange={handleSortChange}>
            <SelectTrigger aria-label="Urutkan proyek" className="h-9 text-xs">
              <SelectValue>{SORT_LABELS[sortPreset]}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="createdAt_desc">Terbaru ditambahkan</SelectItem>
              <SelectItem value="name_asc">Nama A–Z</SelectItem>
              <SelectItem value="code_asc">Kode A–Z</SelectItem>
              <SelectItem value="startDate_desc">Tanggal mulai terbaru</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="h-9 gap-1.5 px-3 text-xs text-text-secondary"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
