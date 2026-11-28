"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectAreasQuery } from "@/hooks/area.hooks";
import { useArchiveProjectOptions } from "@/hooks/report-archive.hooks";
import { cn } from "@/lib/utils";
import type { ListArchivedReportsQuery } from "@/types/api/report.types";
import { ReportMobileSearchBar, ReportSecondaryFilterRow } from "./ReportFilterControls";

type LateFilterValue = "ALL" | "ON_TIME" | "LATE";

const LATE_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "ON_TIME", label: "Tepat Waktu" },
  { value: "LATE", label: "Terlambat" },
] as const;

function countActiveArchiveFilters(filters: ListArchivedReportsQuery): number {
  return [
    Boolean(filters.projectId),
    Boolean(filters.areaId),
    filters.isLate !== undefined,
    Boolean(filters.dateFrom || filters.dateTo),
    Boolean(filters.reportType),
    filters.sortOrder === "asc",
  ].filter(Boolean).length;
}

export function ArchivedReportFilters({
  filters, onChange, onReset,
}: {
  filters: ListArchivedReportsQuery;
  onChange: (patch: Partial<ListArchivedReportsQuery>) => void;
  onReset: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const projects = useArchiveProjectOptions();
  const areas = useProjectAreasQuery(filters.projectId ?? "");
  const selectedProject = projects.data?.find((p) => p.id === filters.projectId);
  const selectedArea = areas.data?.find((a) => a.id === filters.areaId);
  const lateVal: LateFilterValue =
    filters.isLate === undefined ? "ALL" : filters.isLate ? "LATE" : "ON_TIME";

  return (
    <div className="space-y-3">
      <ReportMobileSearchBar
        value={filters.search ?? ""}
        placeholder="Cari nomor, proyek, area, pengawas..."
        panelId="archived-report-filter-panel"
        mobileOpen={mobileOpen}
        activeCount={countActiveArchiveFilters(filters)}
        onSearchChange={(val) => onChange({ search: val || undefined })}
        onToggleOpen={() => setMobileOpen((prev) => !prev)}
      />

      <div id="archived-report-filter-panel" className={cn("space-y-3", !mobileOpen && "hidden lg:block")}>
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:flex lg:flex-1 lg:flex-wrap lg:items-center lg:gap-2">
            <div className="relative hidden min-w-56 flex-1 lg:block lg:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
              <Input
                type="text"
                value={filters.search ?? ""}
                onChange={(event) => onChange({ search: event.target.value || undefined })}
                placeholder="Cari nomor laporan, proyek, area, atau pengawas..."
                className="h-9 pl-8 text-xs"
              />
            </div>

            <div className="w-full lg:w-48">
              <Select
                value={filters.projectId ?? "ALL"}
                disabled={projects.isLoading}
                onValueChange={(val: string | null) =>
                  onChange({ projectId: !val || val === "ALL" ? undefined : val, areaId: undefined })
                }
              >
                <SelectTrigger aria-label="Filter proyek arsip" className="h-11 text-sm lg:h-9 lg:text-xs">
                  <SelectValue placeholder="Semua Proyek">
                    {projects.isLoading ? "Memuat proyek..." : selectedProject ? `${selectedProject.code} · ${selectedProject.name}` : "Semua Proyek"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="ALL">Semua Proyek</SelectItem>
                  {projects.data?.map((project) => <SelectItem key={project.id} value={project.id}>{project.code} · {project.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-44">
              <Select
                value={filters.areaId ?? "ALL"}
                disabled={!filters.projectId || areas.isLoading}
                onValueChange={(val: string | null) => onChange({ areaId: !val || val === "ALL" ? undefined : val })}
              >
                <SelectTrigger aria-label="Filter area arsip" className="h-11 text-sm lg:h-9 lg:text-xs">
                  <SelectValue placeholder="Semua Area">
                    {areas.isLoading ? "Memuat area..." : selectedArea ? `${selectedArea.code} · ${selectedArea.name}` : "Semua Area"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="ALL">Semua Area</SelectItem>
                  {areas.data?.map((area) => <SelectItem key={area.id} value={area.id}>{area.code} · {area.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SegmentedControl
            ariaLabel="Filter keterlambatan arsip"
            options={LATE_OPTIONS}
            value={lateVal}
            onChange={(val) => onChange({ isLate: val === "ALL" ? undefined : val === "LATE" })}
            className="grid w-full auto-cols-fr grid-flow-col lg:inline-flex lg:w-auto"
          />
        </div>

        <ReportSecondaryFilterRow
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          reportType={filters.reportType}
          sortOrder={filters.sortOrder ?? "desc"}
          typeAriaLabel="Filter tipe laporan arsip"
          sortAriaLabel="Urutan tanggal arsip"
          onDateFromChange={(dateFrom) => onChange({ dateFrom })}
          onDateToChange={(dateTo) => onChange({ dateTo })}
          onReportTypeChange={(reportType) => onChange({ reportType })}
          onSortOrderChange={(nextOrder) => onChange({ sortOrder: nextOrder })}
          onReset={onReset}
        />
      </div>

      {(projects.isError || areas.isError) && (
        <div role="alert" className="flex flex-wrap items-center gap-2 text-xs text-status-danger-fg">
          <span>Pilihan filter gagal dimuat.</span>
          <Button type="button" variant="outline" size="sm" onClick={() => { if (projects.isError) void projects.refetch(); if (areas.isError) void areas.refetch(); }}>
            Coba lagi
          </Button>
        </div>
      )}
    </div>
  );
}
