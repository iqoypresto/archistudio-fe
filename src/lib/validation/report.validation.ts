import * as z from "zod";
import type { ReportPhotoInput, SubmitReportPayload } from "@/types/api/report.types";

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

/** Membantu konsumen non-submit membaca cutoff tanpa menetapkan status final laporan. */
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
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  return value("hour") > 17 ||
    (value("hour") === 17 && (value("minute") > 0 || value("second") > 0));
}

export function buildDefaultReportValues(): ReportFormValues {
  return {
    reportType: "WORK",
    progressText: "",
    obstaclesText: "",
    tomorrowPlanText: "",
    weather: "CERAH",
    workerCount: 0,
    locationText: "",
  };
}

export function buildSubmitReportPayload(params: {
  areaId: string;
  reportDate: string;
  values: Partial<ReportFormValues>;
  photos: ReportPhotoInput[];
}): SubmitReportPayload {
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
