"use client";

import { Search, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/SelectField";
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

        <SelectField
          value={filters.role ?? "ALL"}
          onChange={(value) =>
            onFilterChange({
              role: (value === "ALL" ? undefined : value) as UserRole | undefined,
              page: 1,
            })
          }
          aria-label="Filter Peran"
          placeholder="Semua Peran"
          className="h-9"
          options={[{ value: "ALL", label: "Semua Peran" }, { value: "OWNER", label: "Owner" }, { value: "ADMIN", label: "Admin" }, { value: "SUPERVISOR", label: "Supervisor" }]}
        />

        <SelectField
          value={
            filters.isActive === undefined ? "ALL" : filters.isActive ? "true" : "false"
          }
          onChange={(val) => {
            onFilterChange({
              isActive: val === "ALL" ? undefined : val === "true",
              page: 1,
            });
          }}
          aria-label="Filter Status"
          placeholder="Semua Status"
          className="h-9"
          options={[{ value: "ALL", label: "Semua Status" }, { value: "true", label: "Aktif" }, { value: "false", label: "Nonaktif" }]}
        />

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
