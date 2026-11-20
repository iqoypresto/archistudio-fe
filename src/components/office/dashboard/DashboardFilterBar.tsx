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

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-primary p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-56">
          <Select
            value={projectId || "ALL"}
            onValueChange={(val: string | null) => onProjectChange(!val || val === "ALL" ? "" : val)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Pilih Proyek" />
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
            className="h-9"
            value={targetDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-surface-secondary p-1">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              variant={statusFilter === opt.value ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={statusFilter === opt.value}
              onClick={() => onStatusFilterChange(opt.value)}
              className="h-8 rounded-md px-2.5 text-xs font-medium"
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
        className="h-9 gap-2 border-brand-primary/30 text-brand-primary hover:bg-brand-primary/10"
      >
        <FileDown className="h-4 w-4" />
        Export PDF Opsi A
      </Button>
    </div>
  );
}
