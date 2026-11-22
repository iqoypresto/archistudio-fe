import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MY_AREAS_STATUS_QUERY_KEY } from "@/hooks/report-lock.hooks";
import { reportApi } from "@/lib/api/report.api";
import type {
  ListReportsQuery,
  ListArchivedReportsQuery,
  ReviseReportPayload,
  SaveDraftPayload,
  UpdateDraftPayload,
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

export function useSubmitReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      reportId: string;
      submitPayload: UpdateDraftPayload & { sessionId?: string };
    }) => {
      return reportApi.submitReport(params.reportId, params.submitPayload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: MY_AREAS_STATUS_QUERY_KEY });
      toast.success("Laporan harian berhasil dikirim dan diparaf otomatis.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim laporan harian.");
    },
  });
}

export function useSubmitNewReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveDraftPayload & { sessionId: string }) => reportApi.submitNew(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: MY_AREAS_STATUS_QUERY_KEY });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Gagal mengirim laporan."),
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
