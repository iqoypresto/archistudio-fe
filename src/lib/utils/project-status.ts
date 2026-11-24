import type { ProjectStatus } from "@/types/api/project.types";

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PERSIAPAN: "Persiapan",
  BERJALAN: "Berjalan",
  SELESAI: "Selesai",
};

export function projectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status];
}
