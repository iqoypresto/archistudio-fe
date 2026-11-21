"use client";

import { Search, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserFilterParams } from "@/types/api/user.types";
import type { UserRole } from "@/types/api/auth.types";

interface MemberFiltersProps {
  filters: UserFilterParams;
  onFilterChange: (updates: Partial<UserFilterParams>) => void;
  onReset: () => void;
  onOpenCreateModal: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  ALL: "Semua Peran",
  OWNER: "Owner",
  ADMIN: "Admin",
  SUPERVISOR: "Supervisor",
};

const STATUS_LABELS: Record<string, string> = {
  ALL: "Semua Status",
  true: "Aktif",
  false: "Nonaktif",
};

export function MemberFilters({
  filters,
  onFilterChange,
  onReset,
  onOpenCreateModal,
}: MemberFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search || filters.role || filters.isActive !== undefined,
  );
  const roleValue = filters.role ?? "ALL";
  const statusValue =
    filters.isActive === undefined ? "ALL" : filters.isActive ? "true" : "false";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-input/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={filters.search ?? ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            placeholder="Cari nama, username, HP..."
            className="h-8 pl-9 text-xs"
          />
        </div>

        <div className="w-40">
          <Select
            value={roleValue}
            onValueChange={(val: string | null) =>
              onFilterChange({
                role: (!val || val === "ALL" ? undefined : val) as UserRole | undefined,
                page: 1,
              })
            }
          >
            <SelectTrigger aria-label="Filter Peran" className="h-8 text-xs">
              <SelectValue placeholder="Semua Peran">{ROLE_LABELS[roleValue]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Peran</SelectItem>
              <SelectItem value="OWNER">Owner</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <Select
            value={statusValue}
            onValueChange={(val: string | null) =>
              onFilterChange({
                isActive: !val || val === "ALL" ? undefined : val === "true",
                page: 1,
              })
            }
          >
            <SelectTrigger aria-label="Filter Status" className="h-8 text-xs">
              <SelectValue placeholder="Semua Status">{STATUS_LABELS[statusValue]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="true">Aktif</SelectItem>
              <SelectItem value="false">Nonaktif</SelectItem>
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

      <Button
        variant="outline"
        size="sm"
        onClick={onOpenCreateModal}
        className="h-8 gap-1.5 self-start border-border bg-surface text-xs sm:hidden"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Tambah Anggota
      </Button>
    </div>
  );
}
