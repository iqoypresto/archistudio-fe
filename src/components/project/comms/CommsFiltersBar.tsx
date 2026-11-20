"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CommsDirection } from "@/types/api/comms.types";

interface CommsFiltersBarProps {
  dateFrom: string;
  dateTo: string;
  direction: CommsDirection | "";
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDirectionChange: (value: CommsDirection | "") => void;
  onReset: () => void;
}

export function CommsFiltersBar({
  dateFrom,
  dateTo,
  direction,
  onDateFromChange,
  onDateToChange,
  onDirectionChange,
  onReset,
}: CommsFiltersBarProps) {
  const hasFilters = Boolean(dateFrom || dateTo || direction);

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-3.5">
      <div className="space-y-1">
        <label htmlFor="comms-filter-from" className="text-xs text-text-secondary">
          Dari Tanggal
        </label>
        <Input
          id="comms-filter-from"
          type="date"
          value={dateFrom}
          onChange={(event) => onDateFromChange(event.target.value)}
          className="h-10 w-40"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="comms-filter-to" className="text-xs text-text-secondary">
          Sampai Tanggal
        </label>
        <Input
          id="comms-filter-to"
          type="date"
          value={dateTo}
          onChange={(event) => onDateToChange(event.target.value)}
          className="h-10 w-40"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="comms-filter-dir" className="text-xs text-text-secondary">
          Arah
        </label>
        <select
          id="comms-filter-dir"
          value={direction}
          onChange={(event) => onDirectionChange(event.target.value as CommsDirection | "")}
          className="border-border bg-surface text-text-primary focus:ring-primary block h-10 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
        >
          <option value="">Semua Arah</option>
          <option value="INBOUND">Masuk</option>
          <option value="OUTBOUND">Keluar</option>
        </select>
      </div>
      {hasFilters && (
        <Button type="button" variant="ghost" className="min-h-10 gap-1 text-xs" onClick={onReset}>
          <X className="h-3.5 w-3.5" /> Reset
        </Button>
      )}
    </div>
  );
}
