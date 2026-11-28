"use client";

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReportType } from "@/types/api/report.types";

const TYPE_LABELS: Record<string, string> = {
  ALL: "Semua Tipe",
  WORK: "Ada Pekerjaan",
  NO_WORK: "Tanpa Pekerjaan",
};

export function ReportMobileSearchBar({
  value,
  placeholder,
  panelId,
  mobileOpen,
  activeCount,
  onSearchChange,
  onToggleOpen,
}: {
  value: string;
  placeholder: string;
  panelId: string;
  mobileOpen: boolean;
  activeCount: number;
  onSearchChange: (val: string) => void;
  onToggleOpen: () => void;
}) {
  return (
    <div className="flex items-center gap-2 lg:hidden">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 pl-8 text-base md:h-9 md:text-xs"
        />
      </div>
      <Button
        type="button"
        variant={mobileOpen || activeCount > 0 ? "default" : "outline"}
        aria-expanded={mobileOpen}
        aria-controls={panelId}
        onClick={onToggleOpen}
        className="h-11 shrink-0 gap-1.5 px-3 text-xs"
      >
        <SlidersHorizontal className="size-3.5" aria-hidden="true" />
        <span>Filter</span>
        {activeCount > 0 && (
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/15 text-[11px] font-semibold tabular-nums">
            {activeCount}
          </span>
        )}
      </Button>
    </div>
  );
}

export function ReportSecondaryFilterRow({
  dateFrom,
  dateTo,
  reportType,
  sortOrder,
  typeAriaLabel,
  sortAriaLabel,
  onDateFromChange,
  onDateToChange,
  onReportTypeChange,
  onSortOrderChange,
  onReset,
}: {
  dateFrom?: string;
  dateTo?: string;
  reportType?: ReportType;
  sortOrder: "asc" | "desc";
  typeAriaLabel: string;
  sortAriaLabel: string;
  onDateFromChange: (val?: string) => void;
  onDateToChange: (val?: string) => void;
  onReportTypeChange: (val?: ReportType) => void;
  onSortOrderChange: (val: "asc" | "desc") => void;
  onReset: () => void;
}) {
  const typeVal = reportType ?? "ALL";

  return (
    <div className="flex flex-col gap-2.5 border-t border-border/60 pt-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
      <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary lg:flex lg:items-center">
        <span className="hidden lg:inline">Periode:</span>
        <label className="space-y-1 lg:space-y-0">
          <span className="block text-[11px] text-text-muted lg:hidden">Dari tanggal</span>
          <Input
            type="date"
            aria-label="Dari tanggal"
            value={dateFrom ?? ""}
            max={dateTo}
            onChange={(e) => onDateFromChange(e.target.value || undefined)}
            className="h-11 w-full tabular-nums lg:h-9 lg:w-38 lg:text-xs"
          />
        </label>
        <span className="hidden text-text-muted lg:inline">—</span>
        <label className="space-y-1 lg:space-y-0">
          <span className="block text-[11px] text-text-muted lg:hidden">Sampai tanggal</span>
          <Input
            type="date"
            aria-label="Sampai tanggal"
            value={dateTo ?? ""}
            min={dateFrom}
            onChange={(e) => onDateToChange(e.target.value || undefined)}
            className="h-11 w-full tabular-nums lg:h-9 lg:w-38 lg:text-xs"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:items-center">
        <div className="w-full lg:w-40">
          <Select
            value={typeVal}
            onValueChange={(val: string | null) =>
              onReportTypeChange(!val || val === "ALL" ? undefined : (val as ReportType))
            }
          >
            <SelectTrigger aria-label={typeAriaLabel} className="h-11 text-sm lg:h-9 lg:text-xs">
              <SelectValue placeholder="Semua Tipe">{TYPE_LABELS[typeVal]}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="ALL">Semua Tipe</SelectItem>
              <SelectItem value="WORK">Ada Pekerjaan</SelectItem>
              <SelectItem value="NO_WORK">Tanpa Pekerjaan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full lg:w-40">
          <Select
            value={sortOrder}
            onValueChange={(val: string | null) => onSortOrderChange(val === "asc" ? "asc" : "desc")}
          >
            <SelectTrigger aria-label={sortAriaLabel} className="h-11 text-sm lg:h-9 lg:text-xs">
              <SelectValue>{sortOrder === "asc" ? "Terlama dahulu" : "Terbaru dahulu"}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="desc">Terbaru dahulu</SelectItem>
              <SelectItem value="asc">Terlama dahulu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="col-span-2 h-11 w-full gap-1.5 px-3 text-xs text-text-secondary lg:col-span-1 lg:h-9 lg:w-auto"
        >
          <RotateCcw className="size-3.5" /> Reset Filter
        </Button>
      </div>
    </div>
  );
}
