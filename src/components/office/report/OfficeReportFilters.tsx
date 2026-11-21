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
import type { ListReportsQuery, ReportStatus, ReportType } from "@/types/api/report.types";

const STATUS_LABELS: Record<string, string> = {
  ALL: "Semua Status",
  SUBMITTED: "Terkirim",
  DRAFT: "Draf",
};

const TYPE_LABELS: Record<string, string> = {
  ALL: "Semua Tipe",
  WORK: "Ada Pekerjaan",
  NO_WORK: "Tanpa Pekerjaan",
};

export function OfficeReportFilters({
  filters,
  onChange,
  onReset,
}: {
  filters: ListReportsQuery;
  onChange: (patch: Partial<ListReportsQuery>) => void;
  onReset: () => void;
}) {
  const statusVal = filters.status ?? "ALL";
  const typeVal = filters.reportType ?? "ALL";

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
      <div className="relative lg:col-span-2">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
        <Input
          type="text"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value || undefined })}
          placeholder="Cari nomor laporan (LH/...) atau kata kunci"
          className="h-9 pl-9 text-xs"
        />
      </div>

      <Input
        type="date"
        value={filters.dateFrom ?? ""}
        onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
        aria-label="Dari tanggal"
        className="h-9 font-mono text-xs"
      />

      <Input
        type="date"
        value={filters.dateTo ?? ""}
        onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
        aria-label="Sampai tanggal"
        className="h-9 font-mono text-xs"
      />

      <Select
        value={statusVal}
        onValueChange={(val: string | null) =>
          onChange({
            status: !val || val === "ALL" ? undefined : (val as ReportStatus),
          })
        }
      >
        <SelectTrigger aria-label="Filter status laporan" className="h-9 text-xs">
          <SelectValue placeholder="Semua Status">{STATUS_LABELS[statusVal]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Status</SelectItem>
          <SelectItem value="SUBMITTED">Terkirim</SelectItem>
          <SelectItem value="DRAFT">Draf</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <Select
            value={typeVal}
            onValueChange={(val: string | null) =>
              onChange({
                reportType: !val || val === "ALL" ? undefined : (val as ReportType),
              })
            }
          >
            <SelectTrigger aria-label="Filter tipe laporan" className="h-9 text-xs">
              <SelectValue placeholder="Semua Tipe">{TYPE_LABELS[typeVal]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Tipe</SelectItem>
              <SelectItem value="WORK">Ada Pekerjaan</SelectItem>
              <SelectItem value="NO_WORK">Tanpa Pekerjaan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="h-9 px-2.5"
          aria-label="Reset filter"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
