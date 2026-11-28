"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectAreasQuery } from "@/hooks/area.hooks";
import { useProjectsQuery } from "@/hooks/project.hooks";
import { cn } from "@/lib/utils";
import type { ListReportsQuery } from "@/types/api/report.types";
import { ReportMobileSearchBar, ReportSecondaryFilterRow } from "./ReportFilterControls";

type LateFilterValue = "ALL" | "ON_TIME" | "LATE";

const LATE_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "ON_TIME", label: "Tepat Waktu" },
  { value: "LATE", label: "Terlambat" },
] as const;

function countActiveExtraFilters(filters: ListReportsQuery): number {
  return [
    Boolean(filters.projectId),
    Boolean(filters.areaId),
    filters.isLate !== undefined,
    Boolean(filters.dateFrom || filters.dateTo),
    Boolean(filters.reportType),
    filters.sortOrder === "asc",
  ].filter(Boolean).length;
}

export function OfficeReportFilters({
  filters, onChange, onReset,
}: {
  filters: ListReportsQuery;
  onChange: (patch: Partial<ListReportsQuery>) => void;
  onReset: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const projects = useProjectsQuery({ page: 1, pageSize: 100 }).data?.data ?? [];
  const areasQuery = useProjectAreasQuery(filters.projectId ?? "");
  const areas = areasQuery.data ?? [];
  const selectedProject = projects.find((p) => p.id === filters.projectId);
  const selectedArea = areas.find((a) => a.id === filters.areaId);
  const lateVal: LateFilterValue = filters.isLate === undefined ? "ALL" : filters.isLate ? "LATE" : "ON_TIME";
  const sortOrder = filters.sortOrder ?? "desc";

  return (
    <div className="space-y-3">
      <ReportMobileSearchBar
        value={filters.search ?? ""}
        placeholder="Cari nomor, area, atau pengawas..."
        panelId="office-report-filter-panel"
        mobileOpen={mobileOpen}
        activeCount={countActiveExtraFilters(filters)}
        onSearchChange={(val) => onChange({ search: val || undefined })}
        onToggleOpen={() => setMobileOpen((prev) => !prev)}
      />

      <div id="office-report-filter-panel" className={cn("space-y-3", !mobileOpen && "hidden lg:block")}>
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:flex lg:flex-1 lg:flex-wrap lg:items-center lg:gap-2">
            <div className="relative hidden min-w-56 flex-1 lg:block lg:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
              <Input
                type="text"
                value={filters.search ?? ""}
                onChange={(e) => onChange({ search: e.target.value || undefined })}
                placeholder="Cari nomor laporan, area, atau supervisor..."
                className="h-9 pl-8 text-xs"
              />
            </div>

            <div className="w-full lg:w-48">
              <Select
                value={filters.projectId ?? "ALL"}
                onValueChange={(val: string | null) =>
                  onChange({ projectId: !val || val === "ALL" ? undefined : val, areaId: undefined })
                }
              >
                <SelectTrigger aria-label="Filter proyek" className="h-11 text-sm lg:h-9 lg:text-xs">
                  <SelectValue placeholder="Semua Proyek">
                    {selectedProject ? `${selectedProject.code} · ${selectedProject.name}` : "Semua Proyek"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="ALL">Semua Proyek</SelectItem>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.code} · {p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-44">
              <Select
                value={filters.areaId ?? "ALL"}
                disabled={!filters.projectId || areasQuery.isLoading}
                onValueChange={(val: string | null) => onChange({ areaId: !val || val === "ALL" ? undefined : val })}
              >
                <SelectTrigger aria-label="Filter area" className="h-11 text-sm lg:h-9 lg:text-xs">
                  <SelectValue placeholder="Semua Area">
                    {selectedArea ? `${selectedArea.code} · ${selectedArea.name}` : "Semua Area"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="ALL">Semua Area</SelectItem>
                  {areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.code} · {a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SegmentedControl
            ariaLabel="Filter keterlambatan"
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
          sortOrder={sortOrder}
          typeAriaLabel="Filter tipe laporan"
          sortAriaLabel="Urutan laporan"
          onDateFromChange={(dateFrom) => onChange({ dateFrom })}
          onDateToChange={(dateTo) => onChange({ dateTo })}
          onReportTypeChange={(reportType) => onChange({ reportType })}
          onSortOrderChange={(nextOrder) => onChange({ sortOrder: nextOrder })}
          onReset={onReset}
        />
      </div>
    </div>
  );
}
