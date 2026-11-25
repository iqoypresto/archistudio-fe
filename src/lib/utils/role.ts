import type { UserRole } from "@/types/api/auth.types";

/** Mapping label peran di UI agar mudah diubah tanpa migrasi DB (D-07). */
export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  SITE_MANAGER: "Site Manager",
  SUPERVISOR: "Supervisor",
};

/** Kebijakan terpusat role yang diizinkan mengakses Comms In & Out (BR-35, K-02). */
export const COMMS_ALLOWED_ROLES: readonly UserRole[] = [
  "OWNER",
  "ADMIN",
  "SITE_MANAGER",
  "SUPERVISOR",
];

/** Role operasional lapangan mobile-first (D-03, K-01). */
export function isFieldRole(role?: UserRole | null): boolean {
  return role === "SUPERVISOR" || role === "SITE_MANAGER";
}

export function isCommsAllowedRole(role?: UserRole | null): boolean {
  return Boolean(role && COMMS_ALLOWED_ROLES.includes(role));
}

export function getRoleLabel(role?: UserRole | null): string {
  if (!role) return "Pengguna";
  return ROLE_LABELS[role];
}
