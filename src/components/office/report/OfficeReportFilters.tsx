"use client";

import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectAreasQuery } from "@/hooks/area.hooks";
import { useProjectsQuery } from "@/hooks/project.hooks";
import type { ListReportsQuery, ReportType } from "@/types/api/report.types";

type LateFilterValue = "ALL" | "ON_TIME" | "LATE";

const LATE_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "ON_TIME", label: "Tepat Waktu" },
  { value: "LATE", label: "Terlambat" },
] as const;

const TYPE_LABELS: Record<string, string> = {
  ALL: "Semua Tipe",
  WORK: "Ada Pekerjaan",
  NO_WORK: "Tanpa Pekerjaan",
};

export function OfficeReportFilters({
  filters, onChange, onReset,
}: {
  filters: ListReportsQuery;
  onChange: (patch: Partial<ListReportsQuery>) => void;
  onReset: () => void;
}) {
  const projects = useProjectsQuery({ page: 1, pageSize: 100 }).data?.data ?? [];
  const areasQuery = useProjectAreasQuery(filters.projectId ?? "");
  const areas = areasQuery.data ?? [];
  const selectedProject = projects.find((p) => p.id === filters.projectId);
  const selectedArea = areas.find((a) => a.id === filters.areaId);
  const typeVal = filters.reportType ?? "ALL";
  const lateVal: LateFilterValue = filters.isLate === undefined ? "ALL" : filters.isLate ? "LATE" : "ON_TIME";
  const sortOrder = filters.sortOrder ?? "desc";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-56 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              value={filters.search ?? ""}
              onChange={(e) => onChange({ search: e.target.value || undefined })}
              placeholder="Cari nomor laporan, area, atau supervisor..."
              className="h-9 pl-8 text-xs"
            />
          </div>

          <div className="w-48">
            <Select
              value={filters.projectId ?? "ALL"}
              onValueChange={(val: string | null) =>
                onChange({ projectId: !val || val === "ALL" ? undefined : val, areaId: undefined })
              }
            >
              <SelectTrigger aria-label="Filter proyek" className="h-9 text-xs">
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

          <div className="w-44">
            <Select
              value={filters.areaId ?? "ALL"}
              disabled={!filters.projectId || areasQuery.isLoading}
              onValueChange={(val: string | null) => onChange({ areaId: !val || val === "ALL" ? undefined : val })}
            >
              <SelectTrigger aria-label="Filter area" className="h-9 text-xs">
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
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border/60 pt-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          <span>Periode:</span>
          <Input type="date" value={filters.dateFrom ?? ""} max={filters.dateTo} onChange={(e) => onChange({ dateFrom: e.target.value || undefined })} aria-label="Dari tanggal" className="h-9 w-38 text-xs tabular-nums" />
          <span className="text-text-muted">—</span>
          <Input type="date" value={filters.dateTo ?? ""} min={filters.dateFrom} onChange={(e) => onChange({ dateTo: e.target.value || undefined })} aria-label="Sampai tanggal" className="h-9 w-38 text-xs tabular-nums" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-40">
            <Select
              value={typeVal}
              onValueChange={(val: string | null) => onChange({ reportType: !val || val === "ALL" ? undefined : (val as ReportType) })}
            >
              <SelectTrigger aria-label="Filter tipe laporan" className="h-9 text-xs">
                <SelectValue placeholder="Semua Tipe">{TYPE_LABELS[typeVal]}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="ALL">Semua Tipe</SelectItem>
                <SelectItem value="WORK">Ada Pekerjaan</SelectItem>
                <SelectItem value="NO_WORK">Tanpa Pekerjaan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select value={sortOrder} onValueChange={(val: string | null) => onChange({ sortOrder: val === "asc" ? "asc" : "desc" })}>
              <SelectTrigger aria-label="Urutan laporan" className="h-9 text-xs">
                <SelectValue>{sortOrder === "asc" ? "Terlama dahulu" : "Terbaru dahulu"}</SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="desc">Terbaru dahulu</SelectItem>
                <SelectItem value="asc">Terlama dahulu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="button" variant="outline" onClick={onReset} className="h-9 gap-1.5 px-3 text-xs text-text-secondary">
            <RotateCcw className="size-3.5" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
