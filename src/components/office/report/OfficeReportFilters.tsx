"use client";

import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ListReportsQuery, ReportStatus, ReportType } from "@/types/api/report.types";

const SELECT_CLASS =
  "min-h-11 rounded-lg border border-input bg-surface px-3 text-sm text-text-primary outline-none focus:border-primary";

export function OfficeReportFilters({
  filters,
  onChange,
  onReset,
}: {
  filters: ListReportsQuery;
  onChange: (patch: Partial<ListReportsQuery>) => void;
  onReset: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <div className="relative lg:col-span-2">
        <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-text-secondary" />
        <Input
          type="text"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value || undefined })}
          placeholder="Cari nomor laporan (LH/...) atau kata kunci"
          className="min-h-11 pl-9 text-sm"
        />
      </div>

      <Input
        type="date"
        value={filters.dateFrom ?? ""}
        onChange={(e) => onChange({ dateFrom: e.target.value || undefined })}
        aria-label="Dari tanggal"
        className="min-h-11 font-mono text-sm"
      />

      <Input
        type="date"
        value={filters.dateTo ?? ""}
        onChange={(e) => onChange({ dateTo: e.target.value || undefined })}
        aria-label="Sampai tanggal"
        className="min-h-11 font-mono text-sm"
      />

      <select
        value={filters.status ?? "ALL"}
        onChange={(e) =>
          onChange({
            status: e.target.value === "ALL" ? undefined : (e.target.value as ReportStatus),
          })
        }
        aria-label="Filter status laporan"
        className={SELECT_CLASS}
      >
        <option value="ALL">Semua Status</option>
        <option value="SUBMITTED">Terkirim</option>
        <option value="DRAFT">Draf</option>
      </select>

      <div className="flex gap-2">
        <select
          value={filters.reportType ?? "ALL"}
          onChange={(e) =>
            onChange({
              reportType: e.target.value === "ALL" ? undefined : (e.target.value as ReportType),
            })
          }
          aria-label="Filter tipe laporan"
          className={`${SELECT_CLASS} flex-1`}
        >
          <option value="ALL">Semua Tipe</option>
          <option value="WORK">Ada Pekerjaan</option>
          <option value="NO_WORK">Tanpa Pekerjaan</option>
        </select>

        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="min-h-11 px-3"
          aria-label="Reset filter"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  );
}
