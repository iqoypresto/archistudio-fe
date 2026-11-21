"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectAreasQuery } from "@/hooks/area.hooks";
import { useArchiveProjectOptions } from "@/hooks/report-archive.hooks";
import type { ListArchivedReportsQuery } from "@/types/api/report.types";

export function ArchivedReportFilters({
  filters,
  onChange,
  onReset,
}: {
  filters: ListArchivedReportsQuery;
  onChange: (patch: Partial<ListArchivedReportsQuery>) => void;
  onReset: () => void;
}) {
  const projects = useArchiveProjectOptions();
  const areas = useProjectAreasQuery(filters.projectId ?? "");
  const selectedProject = projects.data?.find((p) => p.id === filters.projectId);
  const selectedArea = areas.data?.find((a) => a.id === filters.areaId);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface-input/60 p-3.5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1 text-xs text-text-secondary">
          <span>Project</span>
          <Select
            value={filters.projectId ?? "ALL"}
            disabled={projects.isLoading}
            onValueChange={(val: string | null) =>
              onChange({ projectId: !val || val === "ALL" ? undefined : val })
            }
          >
            <SelectTrigger aria-label="Project" className="h-9 text-xs">
              <SelectValue placeholder="Semua project">
                {projects.isLoading
                  ? "Memuat project…"
                  : selectedProject?.name ?? "Semua project"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua project</SelectItem>
              {projects.data?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 text-xs text-text-secondary">
          <span>Area</span>
          <Select
            value={filters.areaId ?? "ALL"}
            disabled={!filters.projectId || areas.isLoading}
            onValueChange={(val: string | null) =>
              onChange({ areaId: !val || val === "ALL" ? undefined : val })
            }
          >
            <SelectTrigger aria-label="Area" className="h-9 text-xs">
              <SelectValue placeholder="Semua area">
                {areas.isLoading
                  ? "Memuat area…"
                  : selectedArea
                    ? `${selectedArea.code} — ${selectedArea.name}`
                    : "Semua area"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua area</SelectItem>
              {areas.data?.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.code} — {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 text-xs text-text-secondary">
          <span>Urutan tanggal laporan</span>
          <Select
            value={filters.sortOrder}
            onValueChange={(val: string | null) =>
              onChange({ sortOrder: val === "asc" ? "asc" : "desc" })
            }
          >
            <SelectTrigger aria-label="Urutan tanggal laporan" className="h-9 text-xs">
              <SelectValue>
                {filters.sortOrder === "asc" ? "Terlama dahulu" : "Terbaru dahulu"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Terbaru dahulu</SelectItem>
              <SelectItem value="asc">Terlama dahulu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <label className="space-y-1 text-xs text-text-secondary">
          Dari tanggal
          <Input
            type="date"
            value={filters.dateFrom ?? ""}
            className="h-9 font-mono text-xs"
            max={filters.dateTo}
            onChange={(event) => onChange({ dateFrom: event.target.value || undefined })}
          />
        </label>

        <label className="space-y-1 text-xs text-text-secondary">
          Sampai tanggal
          <Input
            type="date"
            value={filters.dateTo ?? ""}
            className="h-9 font-mono text-xs"
            min={filters.dateFrom}
            onChange={(event) => onChange({ dateTo: event.target.value || undefined })}
          />
        </label>

        <Button variant="outline" onClick={onReset} className="h-9 self-end text-xs">
          Reset filter
        </Button>
      </div>

      {(projects.isError || areas.isError) && (
        <div role="alert" className="text-xs text-destructive">
          Pilihan filter gagal dimuat.{" "}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (projects.isError) void projects.refetch();
              if (areas.isError) void areas.refetch();
            }}
          >
            Coba lagi
          </Button>
        </div>
      )}
    </div>
  );
}
