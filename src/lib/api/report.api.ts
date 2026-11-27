import type { ApiResponse } from "@/types/api";
import type {
  DailyReportDetail,
  ListArchivedReportsQuery,
  PaginatedArchivedReportsResponse,
  ListReportsQuery,
  PaginatedReportsResponse,
  ReviseReportPayload,
  SubmitReportPayload,
} from "@/types/api/report.types";
import { api } from "./axios";
import { apiSurfacePath, type ApiSurface } from "./api-surface";

export class ReportApi {
  async createUploadSession(payload: { areaId: string; reportDate: string; reportId?: string }): Promise<{ sessionId: string; expiresAt: string }> {
    const res = await api.post<ApiResponse<{ sessionId: string; expiresAt: string }>>(
      apiSurfacePath("field", "/reports/upload-sessions"), payload
    );
    return res.data.data;
  }

  async cancelUploadSession(sessionId: string): Promise<{ cancelled: boolean; photosDeleted: number; cleanupPending: boolean }> {
    const res = await api.delete<ApiResponse<{ cancelled: boolean; photosDeleted: number; cleanupPending: boolean }>>(
      apiSurfacePath("field", `/reports/upload-sessions/${sessionId}`),
      { timeout: 60_000 },
    );
    return res.data.data;
  }

  cancelUploadSessionOnPageHide(sessionId: string, accessToken: string | null): void {
    if (!accessToken || typeof window === "undefined") return;
    const url = api.getUri({ url: apiSurfacePath("field", `/reports/upload-sessions/${sessionId}`) });
    void fetch(url, {
      method: "DELETE",
      keepalive: true,
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => undefined);
  }

  async listArchive(params: ListArchivedReportsQuery): Promise<PaginatedArchivedReportsResponse> {
    const res = await api.get<PaginatedArchivedReportsResponse>(apiSurfacePath("office", "/reports/archive"), { params });
    return res.data;
  }

  async listReports(params?: ListReportsQuery, surface: ApiSurface = "office"): Promise<PaginatedReportsResponse> {
    const res = await api.get<PaginatedReportsResponse>(apiSurfacePath(surface, "/reports"), { params });
    return res.data;
  }

  async getReportById(reportId: string, surface: ApiSurface = "office"): Promise<DailyReportDetail> {
    const res = await api.get<ApiResponse<DailyReportDetail>>(apiSurfacePath(surface, `/reports/${reportId}`));
    return res.data.data;
  }

  async submitNew(payload: SubmitReportPayload & { sessionId: string }): Promise<DailyReportDetail> {
    const res = await api.post<ApiResponse<DailyReportDetail>>(apiSurfacePath("field", "/reports/submit"), payload);
    return res.data.data;
  }

  async reviseReport(
    reportId: string,
    payload: ReviseReportPayload
  ): Promise<DailyReportDetail> {
    const res = await api.patch<ApiResponse<DailyReportDetail>>(
      apiSurfacePath("office", `/reports/${reportId}/revise`),
      payload
    );
    return res.data.data;
  }
}

export const reportApi = new ReportApi();
