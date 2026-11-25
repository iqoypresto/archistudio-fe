import { isFieldRole } from "@/lib/utils/role";
import type { UserRole } from "@/types/api/auth.types";
import type { ProjectStatus } from "@/types/api/project.types";

export interface ProjectReadOnlyState {
  status?: ProjectStatus;
  archivedAt?: string | null;
}

export interface AreaPermissions {
  isSupervisorReadOnly: boolean;
  isProjectReadOnly: boolean;
  canViewHistory: boolean;
  canEditArea: boolean;
}

/** Menghitung izin aksi UI pada halaman detail project & area (BR-03, BR-09, BR-12, BR-39). */
export function resolveAreaPermissions(
  role?: UserRole | null,
  project?: ProjectReadOnlyState | null,
): AreaPermissions {
  const isOfficeManager = role === "OWNER" || role === "ADMIN";
  const isSupervisorReadOnly = isFieldRole(role);
  const isProjectReadOnly =
    project?.status === "SELESAI" || Boolean(project?.archivedAt);

  return {
    isSupervisorReadOnly,
    isProjectReadOnly,
    canViewHistory: isOfficeManager,
    canEditArea: isOfficeManager && !isProjectReadOnly,
  };
}

/**
 * Menyaring kandidat supervisor untuk penugasan area (BR-08, BR-09).
 * Supervisor yang sedang aktif di area/project lain TETAP ditampilkan dan dapat dipilih;
 * hanya supervisor yang saat ini sudah memegang area target ini yang dikecualikan.
 */
export function filterAssignableSupervisors<T extends { id: string }>(
  supervisors: T[],
  currentAreaSupervisorId?: string | null,
): T[] {
  if (!currentAreaSupervisorId) return supervisors;
  return supervisors.filter((item) => item.id !== currentAreaSupervisorId);
}
