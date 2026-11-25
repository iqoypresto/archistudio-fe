import { z } from "zod";
import type { UserRole } from "@/types/api/auth.types";
import type { ArchivedProjectItem, ProjectStatus } from "@/types/api/project.types";

const projectCodeRegex = /^[a-zA-Z0-9_-]+$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Jakarta", label: "WIB — Asia/Jakarta (Jakarta, Sumatera, Jawa, Kalbar, Kalteng)" },
  { value: "Asia/Makassar", label: "WITA — Asia/Makassar (Bali, NTB, NTT, Sulsel, Kalsel, Kaltim)" },
  { value: "Asia/Jayapura", label: "WIT — Asia/Jayapura (Maluku, Papua)" },
] as const;

export const DAY_OF_WEEK_OPTIONS = [
  { value: 0, label: "Minggu" },
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
] as const;

export const projectFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, "Kode project minimal 2 karakter.")
      .max(20, "Kode project maksimal 20 karakter.")
      .regex(projectCodeRegex, "Kode hanya boleh huruf, angka, strip, atau underscore.")
      .transform((val) => val.toUpperCase()),
    name: z.string().trim().min(1, "Nama project wajib diisi.").max(100),
    location: z.string().trim().min(1, "Lokasi project wajib diisi.").max(200),
    clientName: z.string().trim().min(1, "Nama client wajib diisi.").max(100),
    startDate: z.string().regex(dateRegex, "Pilih tanggal mulai (YYYY-MM-DD)."),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || dateRegex.test(val), "Format tanggal selesai harus YYYY-MM-DD."),
    status: z.enum(["PERSIAPAN", "BERJALAN"]),
    timezone: z.string().min(1, "Pilih zona waktu project."),
    routineHolidays: z.array(z.number().int().min(0).max(6)),
    siteManagerId: z.string().optional(),
  })
  .refine(
    (data) => !data.endDate || data.endDate.trim() === "" || data.endDate >= data.startDate,
    {
      message: "Tanggal selesai project tidak boleh lebih awal dari tanggal mulai.",
      path: ["endDate"],
    },
  );

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const restoreProjectSchema = z.object({
  status: z.enum(["PERSIAPAN", "BERJALAN"]),
});

export type RestoreProjectFormValues = z.infer<typeof restoreProjectSchema>;

export interface ArchivedYearGroup {
  year: number;
  projects: ArchivedProjectItem[];
}

/** Mengelompokkan daftar Archive Project berdasarkan folder tahun tindakan terbaru (BR-39). */
export function groupArchivedProjectsByYear(items: ArchivedProjectItem[]): ArchivedYearGroup[] {
  const byYear = new Map<number, ArchivedProjectItem[]>();
  for (const item of items) {
    const bucket = byYear.get(item.archiveYear) ?? [];
    bucket.push(item);
    byYear.set(item.archiveYear, bucket);
  }
  return Array.from(byYear.entries())
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, projects]) => ({ year, projects }));
}

export interface ProjectArchiveActions {
  canViewArchive: boolean;
  canComplete: boolean;
  canArchive: boolean;
  canRestore: boolean;
}

/** Menentukan izin aksi Archive Project per role & status project (BR-12, BR-39). */
export function resolveProjectArchiveActions(
  role?: UserRole | null,
  project?: { status: ProjectStatus; archivedAt?: string | null } | null,
): ProjectArchiveActions {
  const isOwner = role === "OWNER";
  const isArchived = project?.status === "SELESAI" || Boolean(project?.archivedAt);

  return {
    canViewArchive: role === "OWNER" || role === "ADMIN",
    canComplete: isOwner && Boolean(project) && !isArchived,
    canArchive: isOwner && Boolean(project) && !isArchived,
    canRestore: isOwner && Boolean(project) && isArchived,
  };
}
