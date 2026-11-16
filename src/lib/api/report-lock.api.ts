import type { ApiResponse } from "@/types/api";
import type { SupervisorAreaTaskStatus } from "@/types/api/report-lock.types";
import { api } from "./axios";

export class ReportLockApi {
  async getMyAreasStatus(): Promise<SupervisorAreaTaskStatus[]> {
    const res = await api.get<ApiResponse<SupervisorAreaTaskStatus[]>>(
      "/reports/my-areas-status"
    );
    return res.data.data;
  }
}

export const reportLockApi = new ReportLockApi();
