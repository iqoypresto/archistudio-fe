import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MY_AREAS_STATUS_QUERY_KEY } from "@/hooks/report-lock.hooks";
import { reportApi } from "@/lib/api/report.api";
import { toUpdateDraftPayload } from "@/lib/validation/report.validation";
import type {
  ListReportsQuery,
  ReviseReportPayload,
  SaveDraftPayload,
  UpdateDraftPayload,
} from "@/types/api/report.types";

export const REPORTS_QUERY_KEY = ["reports"] as const;

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

export function useOfficeReportsQuery(query: ListReportsQuery) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, "office", query],
    queryFn: () => reportApi.listReports(query),
  });
}

export function useSaveDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { reportId?: string | null; payload: SaveDraftPayload }) => {
      if (params.reportId) {
        return reportApi.updateDraft(
          params.reportId,
          toUpdateDraftPayload(params.payload)
        );
      }
      return reportApi.saveDraft(params.payload);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: REPORTS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: MY_AREAS_STATUS_QUERY_KEY });
      await queryClient.invalidateQueries({
        queryKey: [...REPORTS_QUERY_KEY, "detail", data.id],
      });
      toast.success("Draf laporan berhasil disimpan.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan draf laporan.");
    },
  });
}

export function useSubmitReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      reportId?: string | null;
      savePayload: SaveDraftPayload;
      submitPayload: UpdateDraftPayload;
    }) => {
      let targetId = params.reportId;
      if (!targetId) {
        const draft = await reportApi.saveDraft(params.savePayload);
        targetId = draft.id;
      }
      return reportApi.submitReport(targetId, params.submitPayload);
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
