"use client";

import { X } from "lucide-react";
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
  const directionLabel =
    direction === "INBOUND" ? "Masuk" : direction === "OUTBOUND" ? "Keluar" : "Semua Arah";

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface-input/60 p-3">
      <div className="space-y-1">
        <label htmlFor="comms-filter-from" className="text-xs text-text-secondary">
          Dari Tanggal
        </label>
        <Input
          id="comms-filter-from"
          type="date"
          value={dateFrom}
          onChange={(event) => onDateFromChange(event.target.value)}
          className="h-9 w-40 font-mono text-xs"
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
          className="h-9 w-40 font-mono text-xs"
        />
      </div>
      <div className="w-40 space-y-1">
        <label htmlFor="comms-filter-dir" className="text-xs text-text-secondary">
          Arah
        </label>
        <Select
          value={direction || "ALL"}
          onValueChange={(val: string | null) =>
            onDirectionChange((!val || val === "ALL" ? "" : val) as CommsDirection | "")
          }
        >
          <SelectTrigger id="comms-filter-dir" className="h-9 text-xs">
            <SelectValue placeholder="Semua Arah">{directionLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Arah</SelectItem>
            <SelectItem value="INBOUND">Masuk</SelectItem>
            <SelectItem value="OUTBOUND">Keluar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {hasFilters && (
        <Button type="button" variant="ghost" className="h-9 gap-1 px-2.5 text-xs" onClick={onReset}>
          <X className="h-3.5 w-3.5" /> Reset
        </Button>
      )}
    </div>
  );
}
