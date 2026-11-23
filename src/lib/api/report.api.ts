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

export class ReportApi {
  async createUploadSession(payload: { areaId: string; reportDate: string; reportId?: string }): Promise<{ sessionId: string; expiresAt: string }> {
    const res = await api.post<ApiResponse<{ sessionId: string; expiresAt: string }>>(
      "/reports/upload-sessions", payload
    );
    return res.data.data;
  }

  async listArchive(params: ListArchivedReportsQuery): Promise<PaginatedArchivedReportsResponse> {
    const res = await api.get<PaginatedArchivedReportsResponse>("/reports/archive", { params });
    return res.data;
  }

  async listReports(params?: ListReportsQuery): Promise<PaginatedReportsResponse> {
    const res = await api.get<PaginatedReportsResponse>("/reports", { params });
    return res.data;
  }

  async getReportById(reportId: string): Promise<DailyReportDetail> {
    const res = await api.get<ApiResponse<DailyReportDetail>>(`/reports/${reportId}`);
    return res.data.data;
  }

  async submitNew(payload: SubmitReportPayload & { sessionId: string }): Promise<DailyReportDetail> {
    const res = await api.post<ApiResponse<DailyReportDetail>>("/reports/submit", payload);
    return res.data.data;
  }

  async reviseReport(
    reportId: string,
    payload: ReviseReportPayload
  ): Promise<DailyReportDetail> {
    const res = await api.patch<ApiResponse<DailyReportDetail>>(
      `/reports/${reportId}/revise`,
      payload
    );
    return res.data.data;
  }
}

export const reportApi = new ReportApi();
