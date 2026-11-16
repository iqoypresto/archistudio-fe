"use client";

import { Search, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserFilterParams } from "@/types/api/user.types";
import type { UserRole } from "@/types/api/auth.types";

interface MemberFiltersProps {
  filters: UserFilterParams;
  onFilterChange: (updates: Partial<UserFilterParams>) => void;
  onReset: () => void;
  onOpenCreateModal: () => void;
}

export function MemberFilters({
  filters,
  onFilterChange,
  onReset,
  onOpenCreateModal,
}: MemberFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search || filters.role || filters.isActive !== undefined,
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={filters.search ?? ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            placeholder="Cari nama, username, HP..."
            className="pl-9"
          />
        </div>

        <select
          value={filters.role ?? ""}
          onChange={(e) =>
            onFilterChange({
              role: (e.target.value || undefined) as UserRole | undefined,
              page: 1,
            })
          }
          className="border-border bg-surface text-text-primary focus:ring-primary h-9 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
          aria-label="Filter Peran"
        >
          <option value="">Semua Peran</option>
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPERVISOR">Supervisor</option>
        </select>

        <select
          value={
            filters.isActive === undefined ? "" : filters.isActive ? "true" : "false"
          }
          onChange={(e) => {
            const val = e.target.value;
            onFilterChange({
              isActive: val === "" ? undefined : val === "true",
              page: 1,
            });
          }}
          className="border-border bg-surface text-text-primary focus:ring-primary h-9 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
          aria-label="Filter Status"
        >
          <option value="">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
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

      <Button onClick={onOpenCreateModal} className="h-9 gap-1.5 self-start sm:self-auto">
        <UserPlus className="h-4 w-4" />
        Tambah Anggota
      </Button>
    </div>
  );
}
