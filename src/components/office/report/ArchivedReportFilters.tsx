"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/SelectField";
import { useProjectAreasQuery } from "@/hooks/area.hooks";
import { useArchiveProjectOptions } from "@/hooks/report-archive.hooks";
import type { ListArchivedReportsQuery } from "@/types/api/report.types";

export function ArchivedReportFilters({ filters, onChange, onReset }: {
  filters: ListArchivedReportsQuery;
  onChange: (patch: Partial<ListArchivedReportsQuery>) => void;
  onReset: () => void;
}) {
  const projects = useArchiveProjectOptions();
  const areas = useProjectAreasQuery(filters.projectId ?? "");
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm">Project
          <SelectField value={filters.projectId ?? "ALL"} disabled={projects.isLoading} onChange={(value) => onChange({ projectId: value === "ALL" ? undefined : value })} placeholder={projects.isLoading ? "Memuat project…" : "Semua project"} options={[{ value: "ALL", label: projects.isLoading ? "Memuat project…" : "Semua project" }, ...(projects.data?.map((project) => ({ value: project.id, label: project.name })) ?? [])]} />
        </label>
        <label className="space-y-1 text-sm">Area
          <SelectField value={filters.areaId ?? "ALL"} disabled={!filters.projectId || areas.isLoading} onChange={(value) => onChange({ areaId: value === "ALL" ? undefined : value })} placeholder={areas.isLoading ? "Memuat area…" : "Semua area"} options={[{ value: "ALL", label: areas.isLoading ? "Memuat area…" : "Semua area" }, ...(areas.data?.map((area) => ({ value: area.id, label: `${area.code} — ${area.name}` })) ?? [])]} />
        </label>
        <label className="space-y-1 text-sm">Urutan tanggal laporan
          <SelectField value={filters.sortOrder ?? "desc"} onChange={(value) => onChange({ sortOrder: value as "asc" | "desc" })} placeholder="Urutan tanggal" options={[{ value: "desc", label: "Terbaru dahulu" }, { value: "asc", label: "Terlama dahulu" }]} />
        </label>
        <label className="space-y-1 text-sm">Dari tanggal
          <Input type="date" value={filters.dateFrom ?? ""} className="min-h-11" max={filters.dateTo}
            onChange={(event) => onChange({ dateFrom: event.target.value || undefined })} />
        </label>
        <label className="space-y-1 text-sm">Sampai tanggal
          <Input type="date" value={filters.dateTo ?? ""} className="min-h-11" min={filters.dateFrom}
            onChange={(event) => onChange({ dateTo: event.target.value || undefined })} />
        </label>
        <Button variant="outline" onClick={onReset} className="min-h-11 self-end">Reset filter</Button>
      </div>
      {(projects.isError || areas.isError) && <div role="alert" className="text-sm text-destructive">
        Pilihan filter gagal dimuat. <Button variant="outline" onClick={() => {
          if (projects.isError) void projects.refetch();
          if (areas.isError) void areas.refetch();
        }}>Coba lagi</Button>
      </div>}
    </div>
  );
}
