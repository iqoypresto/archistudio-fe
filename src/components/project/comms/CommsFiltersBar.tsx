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
          className="h-9 pl-8 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        <span>Periode:</span>
        <Input
          type="date"
          aria-label="Dari tanggal"
          value={dateFrom}
          onChange={(event) => onDateFromChange(event.target.value)}
          className="h-9 w-38 text-xs tabular-nums"
        />
        <span className="text-text-muted">—</span>
        <Input
          type="date"
          aria-label="Sampai tanggal"
          value={dateTo}
          onChange={(event) => onDateToChange(event.target.value)}
          className="h-9 w-38 text-xs tabular-nums"
        />

        {!hideDirectionFilter && (
          <div className="w-36">
            <Select
              value={direction || "ALL"}
              onValueChange={(val: string | null) =>
                onDirectionChange((!val || val === "ALL" ? "" : val) as CommsDirection | "")
              }
            >
              <SelectTrigger aria-label="Filter arah komunikasi" className="h-9 text-xs">
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
            className="h-9 gap-1.5 px-3 text-xs text-text-secondary"
            onClick={onReset}
          >
            <RotateCcw className="size-3.5" /> Reset
          </Button>
        )}
      </div>
    </div>
  );
}
