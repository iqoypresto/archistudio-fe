import * as z from "zod";
import type {
  DailyReportDetail,
  ReportPhotoInput,
  SaveDraftPayload,
  UpdateDraftPayload,
} from "@/types/api/report.types";

export const NO_WORK_REASONS = [
  "Hujan Lebat",
  "Material Terlambat",
  "Lahan Belum Siap",
  "Lainnya",
] as const;

const workReportSchema = z.object({
  reportType: z.literal("WORK"),
  progressText: z
    .string()
    .trim()
    .min(3, "Isi progres pekerjaan minimal 3 karakter."),
  obstaclesText: z
    .string()
    .trim()
    .min(1, "Isi hambatan lapangan (tulis 'Tidak ada' bila lancar)."),
  tomorrowPlanText: z
    .string()
    .trim()
    .min(3, "Isi rencana kerja besok minimal 3 karakter."),
  weather: z.enum(["CERAH", "BERAWAN", "HUJAN"], {
    message: "Pilih kondisi cuaca hari ini.",
  }),
  workerCount: z
    .number({ message: "Masukkan jumlah pekerja hadir." })
    .int("Jumlah pekerja harus berupa angka bulat.")
    .min(0, "Jumlah pekerja minimal 0."),
  noWorkReason: z.string().optional(),
  locationText: z.string().trim().max(250).optional(),
});

const noWorkReportSchema = z.object({
  reportType: z.literal("NO_WORK"),
  noWorkReason: z
    .string()
    .trim()
    .min(3, "Pilih atau tulis alasan hari tanpa pekerjaan minimal 3 karakter."),
  progressText: z.string().optional(),
  obstaclesText: z.string().optional(),
  tomorrowPlanText: z.string().optional(),
  weather: z.enum(["CERAH", "BERAWAN", "HUJAN"]).optional(),
  workerCount: z.number().optional(),
  locationText: z.string().trim().max(250).optional(),
});

export const reportFormSchema = z.discriminatedUnion("reportType", [
  workReportSchema,
  noWorkReportSchema,
]);

export type ReportFormValues = z.infer<typeof reportFormSchema>;

/** Mengecek apakah waktu sekarang melewati pukul 17:00 zona waktu project (BR-18). */
export function isPastProjectCutoff1700(
  now: Date,
  reportDateStr: string,
  timeZone: string
): boolean {
  const businessToday = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  if (businessToday < reportDateStr) return false;
  if (businessToday > reportDateStr) return true;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const second = Number(parts.find((p) => p.type === "second")?.value ?? "0");
  return hour > 17 || (hour === 17 && (minute > 0 || second > 0));
}

export function buildDefaultReportValues(
  draft?: DailyReportDetail | null,
  backup?: Partial<ReportFormValues> | null
): ReportFormValues {
  if (draft) {
    if (draft.reportType === "NO_WORK") {
      return {
        reportType: "NO_WORK",
        noWorkReason: draft.noWorkReason ?? "",
        locationText: draft.locationText ?? "",
      };
    }
    return {
      reportType: "WORK",
      progressText: draft.progressText ?? "",
      obstaclesText: draft.obstaclesText ?? "",
      tomorrowPlanText: draft.tomorrowPlanText ?? "",
      weather: draft.weather ?? "CERAH",
      workerCount: draft.workerCount ?? 0,
      locationText: draft.locationText ?? "",
    };
  }
  if (backup?.reportType === "NO_WORK") {
    return {
      reportType: "NO_WORK",
      noWorkReason: backup.noWorkReason ?? "",
      locationText: backup.locationText ?? "",
    };
  }
  return {
    reportType: "WORK",
    progressText: backup?.progressText ?? "",
    obstaclesText: backup?.obstaclesText ?? "",
    tomorrowPlanText: backup?.tomorrowPlanText ?? "",
    weather: backup?.weather ?? "CERAH",
    workerCount: backup?.workerCount ?? 0,
    locationText: backup?.locationText ?? "",
  };
}

export function buildSaveDraftPayload(params: {
  areaId: string;
  reportDate: string;
  values: Partial<ReportFormValues>;
  photos: ReportPhotoInput[];
}): SaveDraftPayload {
  const reportType = params.values.reportType ?? "WORK";
  return {
    areaId: params.areaId,
    reportDate: params.reportDate,
    reportType,
    progressText: reportType === "WORK" ? params.values.progressText || null : null,
    obstaclesText: reportType === "WORK" ? params.values.obstaclesText || null : null,
    tomorrowPlanText: reportType === "WORK" ? params.values.tomorrowPlanText || null : null,
    weather: reportType === "WORK" ? params.values.weather ?? null : null,
    workerCount: reportType === "WORK" ? params.values.workerCount ?? 0 : null,
    noWorkReason: reportType === "NO_WORK" ? params.values.noWorkReason || null : null,
    locationText: params.values.locationText || null,
    photos: params.photos,
  };
}

export function toUpdateDraftPayload(payload: SaveDraftPayload): UpdateDraftPayload {
  return {
    reportType: payload.reportType,
    progressText: payload.progressText,
    obstaclesText: payload.obstaclesText,
    tomorrowPlanText: payload.tomorrowPlanText,
    weather: payload.weather,
    workerCount: payload.workerCount,
    noWorkReason: payload.noWorkReason,
    locationText: payload.locationText,
    photos: payload.photos,
  };
}
