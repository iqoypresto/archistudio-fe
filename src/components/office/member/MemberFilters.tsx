"use client";

import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserFilterParams } from "@/types/api/user.types";

type StatusSegment = "ALL" | "ACTIVE" | "INACTIVE";
type SortPreset = "name_asc" | "createdAt_desc" | "username_asc";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "INACTIVE", label: "Nonaktif" },
] as const;

const SORT_LABELS: Record<SortPreset, string> = {
  name_asc: "Nama A–Z",
  createdAt_desc: "Terbaru ditambahkan",
  username_asc: "Username A–Z",
};

interface MemberFiltersProps {
  filters: UserFilterParams;
  onFilterChange: (updates: Partial<UserFilterParams>) => void;
  onReset: () => void;
}

export function MemberFilters({ filters, onFilterChange, onReset }: MemberFiltersProps) {
  const statusValue: StatusSegment =
    filters.isActive === undefined ? "ALL" : filters.isActive ? "ACTIVE" : "INACTIVE";
  const sortPreset: SortPreset =
    filters.sortBy === "createdAt"
      ? "createdAt_desc"
      : filters.sortBy === "username"
        ? "username_asc"
        : "name_asc";
  const hasActiveFilters = Boolean(
    filters.search || filters.role || filters.isActive !== undefined,
  );

  const handleSortChange = (val: string | null) => {
    if (val === "createdAt_desc") {
      onFilterChange({ sortBy: "createdAt", sortOrder: "desc", page: 1 });
    } else if (val === "username_asc") {
      onFilterChange({ sortBy: "username", sortOrder: "asc", page: 1 });
    } else {
      onFilterChange({ sortBy: "name", sortOrder: "asc", page: 1 });
    }
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
        <Input
          value={filters.search ?? ""}
          onChange={(e) => onFilterChange({ search: e.target.value || undefined, page: 1 })}
          placeholder="Cari nama, username, atau nomor HP..."
          className="h-9 pl-8 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <SegmentedControl
          ariaLabel="Filter status anggota"
          options={STATUS_OPTIONS}
          value={statusValue}
          onChange={(val) =>
            onFilterChange({
              isActive: val === "ALL" ? undefined : val === "ACTIVE",
              page: 1,
            })
          }
        />

        <div className="w-44">
          <Select value={sortPreset} onValueChange={handleSortChange}>
            <SelectTrigger aria-label="Urutkan anggota" className="h-9 text-xs">
              <SelectValue>{SORT_LABELS[sortPreset]}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="name_asc">Nama A–Z</SelectItem>
              <SelectItem value="createdAt_desc">Terbaru ditambahkan</SelectItem>
              <SelectItem value="username_asc">Username A–Z</SelectItem>
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
