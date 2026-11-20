import { z } from "zod";
import type { UserRole } from "@/types/api/auth.types";
import type { CommsDirection } from "@/types/api/comms.types";
import type { ProjectStatus } from "@/types/api/project.types";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const ALLOWED_COMMS_ATTACHMENT_MIMES: readonly string[] = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const COMMS_ATTACHMENT_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const MAX_COMMS_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export const commsFormSchema = z.object({
  entryDate: z.string().regex(DATE_REGEX, "Format tanggal harus YYYY-MM-DD."),
  direction: z.enum(["INBOUND", "OUTBOUND"]),
  subject: z
    .string()
    .trim()
    .min(1, "Subjek komunikasi wajib diisi.")
    .max(200, "Subjek maksimal 200 karakter."),
  note: z
    .string()
    .trim()
    .max(2000, "Catatan singkat maksimal 2000 karakter.")
    .optional(),
});

export type CommsFormValues = z.infer<typeof commsFormSchema>;

export function getCommsDirectionLabel(direction: CommsDirection): string {
  return direction === "INBOUND" ? "Masuk" : "Keluar";
}

/** Memvalidasi lampiran opsional Comms (PDF/Word/Excel, maks. 5 MB) (BR-35). */
export function validateCommsAttachmentFile(file: {
  type: string;
  size: number;
}): { valid: true } | { valid: false; message: string } {
  if (!ALLOWED_COMMS_ATTACHMENT_MIMES.includes(file.type)) {
    return {
      valid: false,
      message: "Lampiran Comms hanya mendukung format PDF, Word (.doc/.docx), atau Excel (.xls/.xlsx) (BR-35).",
    };
  }
  if (file.size <= 0 || file.size > MAX_COMMS_ATTACHMENT_BYTES) {
    return {
      valid: false,
      message: "Ukuran lampiran Comms maksimal 5 MB per file (BR-35).",
    };
  }
  return { valid: true };
}

export interface CommsPermissions {
  canView: boolean;
  canMutate: boolean;
  isProjectReadOnly: boolean;
}

/** Comms project hanya dapat dilihat & dikelola oleh OWNER (BR-12, BR-35, BR-39). */
export function resolveCommsPermissions(
  role?: UserRole | null,
  project?: { status?: ProjectStatus; archivedAt?: string | null } | null,
): CommsPermissions {
  const isOwner = role === "OWNER";
  const isProjectReadOnly = project?.status === "SELESAI" || Boolean(project?.archivedAt);
  return {
    canView: isOwner,
    canMutate: isOwner && !isProjectReadOnly,
    isProjectReadOnly,
  };
}
