import type { UserRole } from "@/types/api/auth.types";

/** Hanya OWNER dan ADMIN pada Office workspace yang dapat membuat project baru. */
export function canShowFloatingAddProject(role?: UserRole | null): boolean {
  return role === "OWNER" || role === "ADMIN";
}

/** Route kanonis halaman detail project pada Office surface. */
export function getOfficeProjectDetailHref(projectId: string): string {
  return `/office/projects/${projectId}`;
}
