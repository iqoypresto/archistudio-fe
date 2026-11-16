import { z } from "zod";
import type { AreaDailyStatusType } from "@/types/api/dashboard.types";

export const unlockAreaFormSchema = z.object({
  unlockedThroughDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  reason: z
    .string()
    .min(5, "Alasan minimal 5 karakter")
    .max(500, "Alasan maksimal 500 karakter"),
});

export type UnlockAreaFormValues = z.infer<typeof unlockAreaFormSchema>;

export function calculateOnTimePercentage(onTime: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((onTime / total) * 100);
}

export function resolveAreaStatusBadgeTone(
  status: AreaDailyStatusType,
): "success" | "warning" | "danger" | "muted" {
  if (status === "TERKIRIM") return "success";
  if (status === "TERLAMBAT") return "warning";
  if (status === "BELUM_LAPOR") return "danger";
  return "muted";
}
