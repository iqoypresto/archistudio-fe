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
import type { CommsDirection } from "@/types/api/comms.types";

interface CommsFiltersBarProps {
  search: string;
  dateFrom: string;
  dateTo: string;
  direction: CommsDirection | "";
  hideDirectionFilter?: boolean;
  onSearchChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDirectionChange: (value: CommsDirection | "") => void;
  onReset: () => void;
}

export function CommsFiltersBar({
  search,
  dateFrom,
  dateTo,
  direction,
  hideDirectionFilter = false,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onDirectionChange,
  onReset,
}: CommsFiltersBarProps) {
  const hasFilters = Boolean(search || dateFrom || dateTo || (!hideDirectionFilter && direction));
  const directionLabel =
    direction === "INBOUND" ? "Masuk" : direction === "OUTBOUND" ? "Keluar" : "Semua Arah";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari subjek atau isi catatan..."
          className="h-11 pl-8 lg:h-9 lg:text-xs"
        />
      </div>

      <div className="flex flex-col gap-2.5 text-xs text-text-secondary sm:flex-row sm:flex-wrap sm:items-center">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <span className="hidden sm:inline">Periode:</span>
          <label className="space-y-1 sm:space-y-0">
            <span className="block text-[11px] text-text-muted sm:hidden">Dari tanggal</span>
            <Input
              type="date"
              aria-label="Dari tanggal"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
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
              onChange={(event) => onDateToChange(event.target.value)}
              className="h-11 w-full tabular-nums sm:h-9 sm:w-38 sm:text-xs"
            />
          </label>
        </div>

        {(!hideDirectionFilter || hasFilters) && (
          <div className="flex w-full items-center gap-2 sm:w-auto">
            {!hideDirectionFilter && (
              <div className="min-w-0 flex-1 sm:w-36 sm:flex-none">
                <Select
                  value={direction || "ALL"}
                  onValueChange={(val: string | null) =>
                    onDirectionChange((!val || val === "ALL" ? "" : val) as CommsDirection | "")
                  }
                >
                  <SelectTrigger aria-label="Filter arah komunikasi" className="h-11 text-sm sm:h-9 sm:text-xs">
                    <SelectValue placeholder="Semua Arah">{directionLabel}</SelectValue>
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectItem value="ALL">Semua Arah</SelectItem>
                    <SelectItem value="INBOUND">Masuk</SelectItem>
                    <SelectItem value="OUTBOUND">Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {hasFilters && (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full gap-1.5 px-3 text-xs text-text-secondary sm:h-9 sm:w-auto"
                onClick={onReset}
              >
                <RotateCcw className="size-3.5" /> Reset
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
