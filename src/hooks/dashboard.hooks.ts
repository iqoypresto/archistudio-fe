import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  dashboardApi,
  type DashboardSummaryParams,
  type SupervisorLatenessParams,
} from "@/lib/api/dashboard.api";
import { pdfExportApi, type ExportPdfParams } from "@/lib/api/pdf-export.api";
import type { UnlockAreaPayload } from "@/types/api/dashboard.types";

export const DASHBOARD_QUERY_KEYS = {
  all: ["dashboard"] as const,
  summary: (params: DashboardSummaryParams) => ["dashboard", "summary", params] as const,
  supervisorLateness: (params: SupervisorLatenessParams) =>
    ["dashboard", "supervisor-lateness", params] as const,
};

export function useDashboardSummary(
  params: DashboardSummaryParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.summary(params),
    queryFn: () => dashboardApi.getDashboardSummary(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useSupervisorLateness(
  params: SupervisorLatenessParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.supervisorLateness(params),
    queryFn: () => dashboardApi.getSupervisorLateness(params),
    enabled: options.enabled ?? true,
  });
}

export function useUnlockAreaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ areaId, payload }: { areaId: string; payload: UnlockAreaPayload }) =>
      dashboardApi.unlockArea(areaId, payload),
    onSuccess: () => {
      toast.success("Kunci laporan area berhasil dibuka secara manual.");
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Gagal membuka kunci laporan area.";
      toast.error(message);
    },
  });
}

export function useExportDailyReportPdfMutation() {
  return useMutation({
    mutationFn: (params: ExportPdfParams) => pdfExportApi.downloadDailyReportPdf(params),
    onSuccess: () => {
      toast.success("File PDF Laporan Harian berhasil diunduh.");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Gagal mengunduh PDF laporan.";
      toast.error(message);
    },
  });
}
