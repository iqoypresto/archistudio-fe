import type { ApiResponse } from "@/types/api";
import type {
  ListMyReportWorkItemsQuery,
  PaginatedSupervisorReportWorkItems,
  SupervisorAreaTaskStatus,
} from "@/types/api/report-lock.types";
import { api } from "./axios";

export class ReportLockApi {
  async getMyAreasStatus(): Promise<SupervisorAreaTaskStatus[]> {
    const res = await api.get<ApiResponse<SupervisorAreaTaskStatus[]>>(
      "/field/reports/my-areas-status"
    );
    return res.data.data;
  }

  async listMyReportWorkItems(query: ListMyReportWorkItemsQuery): Promise<PaginatedSupervisorReportWorkItems> {
    const res = await api.get<PaginatedSupervisorReportWorkItems>(
      "/field/reports/my-obligations",
      { params: query },
    );
    return res.data;
  }
}

export const reportLockApi = new ReportLockApi();
