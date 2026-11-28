import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { DashboardStatusFilter } from "@/types/api/dashboard.types";

export type DisciplineTier = "ALL" | "GOOD" | "LOW";

const AREA_STATUS_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "UNREPORTED", label: "Belum Lapor" },
  { value: "LATE", label: "Terlambat" },
  { value: "OVERDUE_GT_3_DAYS", label: "Tertunggak > 3 Hari" },
] as const;

const TIER_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "GOOD", label: "≥ 80%" },
  { value: "LOW", label: "< 60%" },
] as const;

export function DashboardAreaToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: DashboardStatusFilter;
  onStatusFilterChange: (val: DashboardStatusFilter) => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari kode area, proyek, atau supervisor..."
          className="h-11 pl-8 sm:h-9 sm:text-xs"
        />
      </div>
      <SegmentedControl
        ariaLabel="Filter status area"
        options={AREA_STATUS_OPTIONS}
        value={statusFilter}
        onChange={onStatusFilterChange}
        className="w-full sm:w-auto"
      />
    </div>
  );
}

export function DashboardSupervisorToolbar({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  tierFilter,
  onTierFilterChange,
}: {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (val: string) => void;
  onDateToChange: (val: string) => void;
  tierFilter: DisciplineTier;
  onTierFilterChange: (val: DisciplineTier) => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary sm:flex sm:items-center">
        <span className="hidden sm:inline">Periode:</span>
        <label className="space-y-1 sm:space-y-0">
          <span className="block text-[11px] text-text-muted sm:hidden">Dari tanggal</span>
          <Input
            type="date"
            aria-label="Dari tanggal"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="h-11 w-full tabular-nums sm:h-9 sm:w-38 sm:text-xs"
          />
        </label>
        <span className="hidden text-text-muted sm:inline">—</span>
        <label className="space-y-1 sm:space-y-0">
          <span className="block text-[11px] text-text-muted sm:hidden">Sampai tanggal</span>
          <Input
            type="date"
            aria-label="Sampai tanggal"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="h-11 w-full tabular-nums sm:h-9 sm:w-38 sm:text-xs"
          />
        </label>
      </div>
      <SegmentedControl
        ariaLabel="Filter tingkat disiplin"
        options={TIER_OPTIONS}
        value={tierFilter}
        onChange={onTierFilterChange}
        className="grid w-full auto-cols-fr grid-flow-col sm:inline-flex sm:w-auto"
      />
    </div>
  );
}
