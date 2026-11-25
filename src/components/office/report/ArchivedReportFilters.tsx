"use client";

import { RotateCcw } from "lucide-react";
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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-52">
            <Select
              value={filters.projectId ?? "ALL"}
              disabled={projects.isLoading}
              onValueChange={(val: string | null) =>
                onChange({
                  projectId: !val || val === "ALL" ? undefined : val,
                  areaId: undefined,
                })
              }
            >
              <SelectTrigger aria-label="Filter proyek arsip" className="h-9 text-xs">
                <SelectValue placeholder="Semua Proyek">
                  {projects.isLoading
                    ? "Memuat proyek..."
                    : selectedProject?.name ?? "Semua Proyek"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="ALL">Semua Proyek</SelectItem>
                {projects.data?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <Select
              value={filters.areaId ?? "ALL"}
              disabled={!filters.projectId || areas.isLoading}
              onValueChange={(val: string | null) =>
                onChange({ areaId: !val || val === "ALL" ? undefined : val })
              }
            >
              <SelectTrigger aria-label="Filter area arsip" className="h-9 text-xs">
                <SelectValue placeholder="Semua Area">
                  {areas.isLoading
                    ? "Memuat area..."
                    : selectedArea
                      ? `${selectedArea.code} · ${selectedArea.name}`
                      : "Semua Area"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="ALL">Semua Area</SelectItem>
                {areas.data?.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.code} · {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            <span>Periode:</span>
            <Input
              type="date"
              aria-label="Dari tanggal"
              value={filters.dateFrom ?? ""}
              max={filters.dateTo}
              onChange={(event) => onChange({ dateFrom: event.target.value || undefined })}
              className="h-9 w-38 text-xs tabular-nums"
            />
            <span className="text-text-muted">—</span>
            <Input
              type="date"
              aria-label="Sampai tanggal"
              value={filters.dateTo ?? ""}
              min={filters.dateFrom}
              onChange={(event) => onChange({ dateTo: event.target.value || undefined })}
              className="h-9 w-38 text-xs tabular-nums"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select
              value={filters.sortOrder ?? "desc"}
              onValueChange={(val: string | null) =>
                onChange({ sortOrder: val === "asc" ? "asc" : "desc" })
              }
            >
              <SelectTrigger aria-label="Urutan tanggal arsip" className="h-9 text-xs">
                <SelectValue>
                  {filters.sortOrder === "asc" ? "Terlama dahulu" : "Terbaru dahulu"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="desc">Terbaru dahulu</SelectItem>
                <SelectItem value="asc">Terlama dahulu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="h-9 gap-1.5 px-3 text-xs text-text-secondary"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {(projects.isError || areas.isError) && (
        <div role="alert" className="text-xs text-status-danger-fg">
          Pilihan filter gagal dimuat.{" "}
          <Button
            type="button"
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
