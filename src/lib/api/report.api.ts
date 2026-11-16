import type { ApiResponse } from "@/types/api";
import type {
  DailyReportDetail,
  ListReportsQuery,
  PaginatedReportsResponse,
  SaveDraftPayload,
  UpdateDraftPayload,
} from "@/types/api/report.types";
import { api } from "./axios";

export class ReportApi {
  async listReports(params?: ListReportsQuery): Promise<PaginatedReportsResponse> {
    const res = await api.get<PaginatedReportsResponse>("/reports", { params });
    return res.data;
  }

  async getReportById(reportId: string): Promise<DailyReportDetail> {
    const res = await api.get<ApiResponse<DailyReportDetail>>(`/reports/${reportId}`);
    return res.data.data;
  }

  async saveDraft(payload: SaveDraftPayload): Promise<DailyReportDetail> {
    const res = await api.post<ApiResponse<DailyReportDetail>>("/reports/draft", payload);
    return res.data.data;
  }

  async updateDraft(
    reportId: string,
    payload: UpdateDraftPayload
  ): Promise<DailyReportDetail> {
    const res = await api.put<ApiResponse<DailyReportDetail>>(
      `/reports/${reportId}/draft`,
      payload
    );
    return res.data.data;
  }

  async submitReport(
    reportId: string,
    payload: UpdateDraftPayload
  ): Promise<DailyReportDetail> {
    const res = await api.post<ApiResponse<DailyReportDetail>>(
      `/reports/${reportId}/submit`,
      payload
    );
    return res.data.data;
  }
}

export const reportApi = new ReportApi();
