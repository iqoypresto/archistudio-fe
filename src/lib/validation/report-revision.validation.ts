import * as z from "zod";
import type { UserRole } from "@/types/api/auth.types";
import type {
  ReportRevisionSnapshot,
  ReportStatus,
} from "@/types/api/report.types";

export const reviseReportSchema = z.object({
  changeSummary: z
    .string()
    .trim()
    .min(3, "Ringkasan perubahan revisi minimal 3 karakter.")
    .max(500, "Ringkasan perubahan revisi maksimal 500 karakter."),
  progressText: z.string().trim().optional(),
  obstaclesText: z.string().trim().optional(),
  tomorrowPlanText: z.string().trim().optional(),
  weather: z.enum(["CERAH", "BERAWAN", "HUJAN"]).optional(),
  workerCount: z.number().int().min(0, "Jumlah pekerja minimal 0.").optional(),
  noWorkReason: z.string().trim().optional(),
  locationText: z.string().trim().max(250).optional(),
});

export type ReviseReportFormValues = z.infer<typeof reviseReportSchema>;

/** Hanya OWNER yang boleh merevisi laporan berstatus SUBMITTED (BR-02, BR-24). */
export function canOwnerReviseReport(
  role?: UserRole | null,
  status?: ReportStatus | null
): boolean {
  return role === "OWNER" && status === "SUBMITTED";
}

/** Mem-parsing snapshot JSON versi lama secara aman (ADR-05). */
export function parseRevisionSnapshot(raw: unknown): ReportRevisionSnapshot | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as Record<string, unknown>;
  if (candidate.reportType !== "WORK" && candidate.reportType !== "NO_WORK") {
    return null;
  }
  return {
    reportType: candidate.reportType,
    progressText: typeof candidate.progressText === "string" ? candidate.progressText : null,
    obstaclesText: typeof candidate.obstaclesText === "string" ? candidate.obstaclesText : null,
    tomorrowPlanText:
      typeof candidate.tomorrowPlanText === "string" ? candidate.tomorrowPlanText : null,
    weather:
      candidate.weather === "CERAH" ||
      candidate.weather === "BERAWAN" ||
      candidate.weather === "HUJAN"
        ? candidate.weather
        : null,
    workerCount: typeof candidate.workerCount === "number" ? candidate.workerCount : null,
    noWorkReason: typeof candidate.noWorkReason === "string" ? candidate.noWorkReason : null,
    locationText: typeof candidate.locationText === "string" ? candidate.locationText : null,
    submittedAt: typeof candidate.submittedAt === "string" ? candidate.submittedAt : null,
    isLate: Boolean(candidate.isLate),
    signedByName: typeof candidate.signedByName === "string" ? candidate.signedByName : null,
    signedByTitle: typeof candidate.signedByTitle === "string" ? candidate.signedByTitle : null,
    photos: Array.isArray(candidate.photos)
      ? (candidate.photos as ReportRevisionSnapshot["photos"])
      : [],
  };
}
