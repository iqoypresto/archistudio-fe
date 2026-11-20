import type { UserRole } from "@/types/api/auth.types";
import type { DrawingMimeType } from "@/types/api/drawing.types";
import type { ProjectStatus } from "@/types/api/project.types";

export const ALLOWED_DRAWING_MIMES: readonly DrawingMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const MAX_DRAWING_BYTES = 4 * 1024 * 1024;

/** Memvalidasi format gambar Drawing sebelum kompresi (JPG/PNG/WebP — BR-33). */
export function validateDrawingFileType(file: {
  type: string;
}): { valid: true; mimeType: DrawingMimeType } | { valid: false; message: string } {
  if (!ALLOWED_DRAWING_MIMES.includes(file.type as DrawingMimeType)) {
    return {
      valid: false,
      message: "Drawing hanya mendukung file JPG, PNG, atau WebP (bukan PDF/SketchUp — BR-33).",
    };
  }
  return { valid: true, mimeType: file.type as DrawingMimeType };
}

/** Memvalidasi ukuran akhir Drawing setelah kompresi browser (maks. 4 MB — BR-33). */
export function validateCompressedDrawingSize(sizeBytes: number): {
  valid: boolean;
  message?: string;
} {
  if (sizeBytes <= 0 || sizeBytes > MAX_DRAWING_BYTES) {
    return {
      valid: false,
      message: "Ukuran gambar masih melebihi 4 MB setelah kompresi. Silakan pilih gambar lain (BR-33).",
    };
  }
  return { valid: true };
}

export interface DrawingPermissions {
  canView: boolean;
  canManage: boolean;
  isProjectReadOnly: boolean;
}

/** Menentukan izin lihat/kelola Drawing berdasarkan role dan status project (BR-12, BR-32, BR-39). */
export function resolveDrawingPermissions(
  role?: UserRole | null,
  project?: { status?: ProjectStatus; archivedAt?: string | null } | null,
): DrawingPermissions {
  const isProjectReadOnly = project?.status === "SELESAI" || Boolean(project?.archivedAt);
  const canView = role === "OWNER" || role === "ADMIN" || role === "SUPERVISOR";
  return {
    canView,
    canManage: role === "OWNER" && !isProjectReadOnly,
    isProjectReadOnly,
  };
}
