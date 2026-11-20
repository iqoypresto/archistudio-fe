"use client";

import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/SelectField";
import type { ListReportsQuery, ReportStatus, ReportType } from "@/types/api/report.types";

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

      <SelectField value={filters.status ?? "ALL"} onChange={(value) => onChange({ status: value === "ALL" ? undefined : value as ReportStatus })} ariaLabel="Filter status laporan" placeholder="Semua Status" options={[{ value: "ALL", label: "Semua Status" }, { value: "SUBMITTED", label: "Terkirim" }, { value: "DRAFT", label: "Draf" }]} />

      <div className="flex gap-2">
        <SelectField value={filters.reportType ?? "ALL"} onChange={(value) => onChange({ reportType: value === "ALL" ? undefined : value as ReportType })} ariaLabel="Filter tipe laporan" placeholder="Semua Tipe" className="flex-1" options={[{ value: "ALL", label: "Semua Tipe" }, { value: "WORK", label: "Ada Pekerjaan" }, { value: "NO_WORK", label: "Tanpa Pekerjaan" }]} />

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
