import type { UserRole } from "@/types/api/auth.types";
import type { ProjectDocumentType } from "@/types/api/project-document.types";
import type { ProjectStatus } from "@/types/api/project.types";

export const ALLOWED_PROJECT_DOCUMENT_MIMES: readonly string[] = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const PROJECT_DOCUMENT_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const MAX_PROJECT_DOCUMENT_BYTES = 5 * 1024 * 1024;

export function getDocumentTypeLabel(type: ProjectDocumentType): string {
  if (type === "QUOTATION") return "Quotation";
  if (type === "BAST") return "BAST";
  return "Invoice";
}

/** Memvalidasi format PDF/Word/Excel dan ukuran maksimal 5 MB per file (BR-34). */
export function validateProjectDocumentFile(file: {
  type: string;
  size: number;
}): { valid: true } | { valid: false; message: string } {
  if (!ALLOWED_PROJECT_DOCUMENT_MIMES.includes(file.type)) {
    return {
      valid: false,
      message: "Dokumen keluar hanya mendukung format PDF, Word (.doc/.docx), atau Excel (.xls/.xlsx) (BR-34).",
    };
  }
  if (file.size <= 0 || file.size > MAX_PROJECT_DOCUMENT_BYTES) {
    return {
      valid: false,
      message: "Ukuran file dokumen keluar maksimal 5 MB per file (BR-34).",
    };
  }
  return { valid: true };
}

export interface ProjectDocumentPermissions {
  canView: boolean;
  canMutate: boolean;
  isProjectReadOnly: boolean;
}

/** Dokumen keluar hanya dapat dilihat & dikelola oleh OWNER (BR-12, BR-34, BR-39). */
export function resolveProjectDocumentPermissions(
  role?: UserRole | null,
  project?: { status?: ProjectStatus; archivedAt?: string | null } | null,
): ProjectDocumentPermissions {
  const isOwner = role === "OWNER";
  const isProjectReadOnly = project?.status === "SELESAI" || Boolean(project?.archivedAt);
  return {
    canView: isOwner,
    canMutate: isOwner && !isProjectReadOnly,
    isProjectReadOnly,
  };
}
