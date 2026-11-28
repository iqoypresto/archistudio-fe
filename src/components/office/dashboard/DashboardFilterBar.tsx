import { Calendar, FileDown } from "lucide-react";
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
import type { ProjectListItem } from "@/types/api/project.types";

interface DashboardFilterBarProps {
  projectId: string;
  onProjectChange: (id: string) => void;
  targetDate: string;
  onTargetDateChange: (date: string) => void;
  onOpenExportDialog: () => void;
}

export function DashboardFilterBar({
  projectId,
  onProjectChange,
  targetDate,
  onTargetDateChange,
  onOpenExportDialog,
}: DashboardFilterBarProps) {
  const { data: projectsRes } = useProjectsQuery({ status: "BERJALAN", page: 1, pageSize: 100 });
  const projects: ProjectListItem[] = projectsRes?.data ?? [];
  const selectedProject = projects.find((p) => p.id === projectId);
  const selectedProjectLabel = selectedProject
    ? `${selectedProject.code} · ${selectedProject.name}`
    : "Semua Proyek";

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
      <div className="col-span-2 w-full sm:w-52">
        <Select
          value={projectId || "ALL"}
          onValueChange={(val: string | null) =>
            onProjectChange(!val || val === "ALL" ? "" : val)
          }
        >
          <SelectTrigger className="h-11 bg-surface text-sm sm:h-9 sm:text-xs" aria-label="Filter proyek">
            <SelectValue placeholder="Semua Proyek">{selectedProjectLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="ALL">Semua Proyek</SelectItem>
            {projects.map((p: ProjectListItem) => (
              <SelectItem key={p.id} value={p.id}>
                {p.code} · {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative col-span-1 w-full sm:w-auto">
        <Calendar
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <Input
          type="date"
          aria-label="Tanggal bisnis"
          value={targetDate}
          onChange={(e) => onTargetDateChange(e.target.value)}
          className="h-11 w-full bg-surface pl-8 tabular-nums sm:h-9 sm:w-40 sm:text-xs"
        />
      </div>

      <Button
        type="button"
        size="sm"
        onClick={onOpenExportDialog}
        className="col-span-1 h-11 w-full gap-1.5 px-3 text-xs sm:h-9 sm:w-auto"
      >
        <FileDown className="size-3.5 shrink-0" />
        <span className="sm:hidden">Export PDF</span>
        <span className="hidden sm:inline">Export PDF Harian</span>
      </Button>
    </div>
  );
}
