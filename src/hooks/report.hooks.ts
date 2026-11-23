import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MY_AREAS_STATUS_QUERY_KEY } from "@/hooks/report-lock.hooks";
import { reportApi } from "@/lib/api/report.api";
import type {
  ListReportsQuery,
  ListArchivedReportsQuery,
  ReviseReportPayload,
  SubmitReportPayload,
} from "@/types/api/report.types";

export const REPORTS_QUERY_KEY = ["reports"] as const;

export function useArchivedReportsQuery(query: ListArchivedReportsQuery) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, "archive", query],
    queryFn: () => reportApi.listArchive(query),
  });
}

export function useReportDetailQuery(reportId?: string | null) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, "detail", reportId],
    queryFn: () => reportApi.getReportById(reportId ?? ""),
    enabled: Boolean(reportId),
  });
}

export function useMyReportHistoryQuery(query: ListReportsQuery) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, "history", query],
    queryFn: () => reportApi.listReports(query),
  });
}

export function useOfficeReportsQuery(query: ListReportsQuery, enabled = true) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, "office", query],
    enabled,
    queryFn: () => reportApi.listReports(query),
  });
}

export function useSubmitNewReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitReportPayload & { sessionId: string }) => reportApi.submitNew(payload),
    onSuccess: (report) => {
      queryClient.setQueryData([...REPORTS_QUERY_KEY, "detail", report.id], report);
      void queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MY_AREAS_STATUS_QUERY_KEY });
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
        queryKey: [...REPORTS_QUERY_KEY, "detail", data.id],
      });
      toast.success("Revisi laporan berhasil disimpan dan dicatat ke riwayat.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal merevisi laporan.");
    },
  });
}
