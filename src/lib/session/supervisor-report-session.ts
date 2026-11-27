import * as z from "zod";

const reportValuesSchema = z.object({
  reportType: z.enum(["WORK", "NO_WORK"]).optional(),
  progressText: z.string().optional(),
  obstaclesText: z.string().optional(),
  tomorrowPlanText: z.string().optional(),
  weather: z.enum(["CERAH", "BERAWAN", "HUJAN"]).optional(),
  workerCount: z.number().int().min(0).optional(),
  noWorkReason: z.string().optional(),
  locationText: z.string().optional(),
});

const reportPhotoSchema = z.object({
  id: z.string().min(1),
  fileName: z.string(),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  caption: z.string(),
  storedFileId: z.string().nullable(),
  uploadSessionId: z.string().nullable().optional(),
  takenAt: z.string().nullable(),
});

const supervisorReportDraftSchema = z.object({
  version: z.literal(1),
  values: reportValuesSchema,
  step: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  uploadSession: z.object({ sessionId: z.string().min(1), expiresAt: z.string() }).nullable(),
  photos: z.array(reportPhotoSchema).max(10),
});

export type PersistedReportPhoto = z.infer<typeof reportPhotoSchema>;
export type SupervisorReportDraft = z.infer<typeof supervisorReportDraftSchema>;

const REPORT_DRAFT_PREFIX = "archistudio:supervisor-report:v1";

export function supervisorReportDraftKey(areaId: string, reportDate: string): string {
  return `${REPORT_DRAFT_PREFIX}:${encodeURIComponent(areaId)}:${encodeURIComponent(reportDate)}`;
}

export function readSupervisorReportDraft(key: string): SupervisorReportDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = supervisorReportDraftSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
    window.sessionStorage.removeItem(key);
  } catch {
    return null;
  }
  return null;
}

export function writeSupervisorReportDraft(key: string, draft: SupervisorReportDraft): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function removeSupervisorReportDraft(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Storage may be unavailable in a restricted browser context.
  }
}
