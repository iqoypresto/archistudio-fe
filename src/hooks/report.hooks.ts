import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MY_AREAS_STATUS_QUERY_KEY, MY_REPORT_WORK_ITEMS_QUERY_KEY } from "@/hooks/report-lock.hooks";
import { reportApi } from "@/lib/api/report.api";
import type { ApiSurface } from "@/lib/api/api-surface";
import type {
  ListReportsQuery,
  ListArchivedReportsQuery,
  ReviseReportPayload,
  SubmitReportPayload,
} from "@/types/api/report.types";

export const REPORTS_QUERY_KEY = ["reports"] as const;

export function useArchivedReportsQuery(query: ListArchivedReportsQuery, enabled = true) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, "office", "archive", query],
    enabled,
    queryFn: () => reportApi.listArchive(query),
  });
}

export function useReportDetailQuery(reportId?: string | null, surface: ApiSurface = "office") {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, surface, "detail", reportId],
    queryFn: () => reportApi.getReportById(reportId ?? "", surface),
    enabled: Boolean(reportId),
  });
}

export function useMyReportHistoryQuery(query: ListReportsQuery, enabled = true) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, "field", "history", query],
    enabled,
    queryFn: () => reportApi.listReports(query, "field"),
  });
}

export function useOfficeReportsQuery(query: ListReportsQuery, enabled = true) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, "office", "list", query],
    enabled,
    queryFn: () => reportApi.listReports(query, "office"),
  });
}

export function useSubmitNewReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitReportPayload & { sessionId: string }) => reportApi.submitNew(payload),
    onSuccess: (report) => {
      queryClient.setQueryData([...REPORTS_QUERY_KEY, "field", "detail", report.id], report);
      void queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MY_AREAS_STATUS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MY_REPORT_WORK_ITEMS_QUERY_KEY });
    },
  });
}

export function useReviseReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { reportId: string; payload: ReviseReportPayload }) =>
      reportApi.reviseReport(params.reportId, params.payload),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: [...REPORTS_QUERY_KEY, "office", "detail", data.id],
      });
      toast.success("Revisi laporan berhasil disimpan dan dicatat ke riwayat.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal merevisi laporan.");
    },
  });
}
