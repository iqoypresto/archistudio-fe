import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectsQuery } from "@/hooks/project.hooks";
import type { DashboardStatusFilter } from "@/types/api/dashboard.types";
import type { ProjectListItem } from "@/types/api/project.types";

interface DashboardFilterBarProps {
  projectId: string;
  onProjectChange: (id: string) => void;
  targetDate: string;
  onDateChange: (date: string) => void;
  statusFilter: DashboardStatusFilter;
  onStatusFilterChange: (status: DashboardStatusFilter) => void;
  onOpenExportDialog: () => void;
}

const STATUS_OPTIONS: { value: DashboardStatusFilter; label: string }[] = [
  { value: "ALL", label: "Semua Status" },
  { value: "UNREPORTED", label: "Belum Lapor" },
  { value: "LATE", label: "Terlambat" },
  { value: "OVERDUE_GT_3_DAYS", label: "Tertunggak > 3 Hari" },
];

export function DashboardFilterBar({
  projectId,
  onProjectChange,
  targetDate,
  onDateChange,
  statusFilter,
  onStatusFilterChange,
  onOpenExportDialog,
}: DashboardFilterBarProps) {
  const { data: projectsRes } = useProjectsQuery({ page: 1, pageSize: 100 });
  const projects: ProjectListItem[] = projectsRes?.data ?? [];
  const selectedProject = projects.find((p) => p.id === projectId);
  const selectedProjectLabel = selectedProject
    ? `[${selectedProject.code}] ${selectedProject.name}`
    : "Semua Proyek";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-input/60 p-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="w-56">
          <Select
            value={projectId || "ALL"}
            onValueChange={(val: string | null) =>
              onProjectChange(!val || val === "ALL" ? "" : val)
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Pilih Proyek">{selectedProjectLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Proyek</SelectItem>
              {projects.map((p: ProjectListItem) => (
                <SelectItem key={p.id} value={p.id}>
                  [{p.code}] {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <Input
            type="date"
            className="h-8 font-mono text-xs"
            value={targetDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border/80 bg-surface p-1">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              variant="ghost"
              aria-pressed={statusFilter === opt.value}
              onClick={() => onStatusFilterChange(opt.value)}
              className={`h-auto min-h-9 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? "bg-surface-active text-text-primary shadow-2xs ring-1 ring-white/[0.06]"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onOpenExportDialog}
        className="h-8 gap-1.5 border-border bg-surface px-3 text-xs text-text-primary hover:bg-surface-active"
      >
        <FileDown className="size-3.5" />
        Export PDF Opsi A
      </Button>
    </div>
  );
}
