"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectAreasQuery } from "@/hooks/area.hooks";
import { useArchiveProjectOptions } from "@/hooks/report-archive.hooks";
import type { ListArchivedReportsQuery } from "@/types/api/report.types";

const SELECT = "min-h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm";

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
          <select className={SELECT} value={filters.projectId ?? ""} disabled={projects.isLoading}
            onChange={(event) => onChange({ projectId: event.target.value || undefined })}>
            <option value="">{projects.isLoading ? "Memuat project…" : "Semua project"}</option>
            {projects.data?.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm">Area
          <select className={SELECT} value={filters.areaId ?? ""}
            disabled={!filters.projectId || areas.isLoading}
            onChange={(event) => onChange({ areaId: event.target.value || undefined })}>
            <option value="">{areas.isLoading ? "Memuat area…" : "Semua area"}</option>
            {areas.data?.map((area) => <option key={area.id} value={area.id}>{area.code} — {area.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm">Urutan tanggal laporan
          <select className={SELECT} value={filters.sortOrder}
            onChange={(event) => onChange({ sortOrder: event.target.value as "asc" | "desc" })}>
            <option value="desc">Terbaru dahulu</option><option value="asc">Terlama dahulu</option>
          </select>
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
