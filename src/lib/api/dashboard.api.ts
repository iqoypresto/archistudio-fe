import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types/api";
import type {
  DashboardStatusFilter,
  DashboardSummaryResponse,
  SupervisorLatenessItem,
  UnlockAreaPayload,
  UnlockAreaResponse,
} from "@/types/api/dashboard.types";

export interface DashboardSummaryParams {
  projectId?: string;
  date?: string;
  statusFilter?: DashboardStatusFilter;
}

export interface SupervisorLatenessParams {
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const dashboardApi = {
  /** Mengambil ringkasan metrik KPI dan status area harian (US-12). */
  async getDashboardSummary(params: DashboardSummaryParams): Promise<DashboardSummaryResponse> {
    const res = await api.get<ApiResponse<DashboardSummaryResponse>>("/dashboard/summary", {
      params: {
        ...(params.projectId ? { projectId: params.projectId } : {}),
        ...(params.date ? { date: params.date } : {}),
        ...(params.statusFilter && params.statusFilter !== "ALL"
          ? { statusFilter: params.statusFilter }
          : {}),
      },
    });
    return res.data.data;
  },

  /** Mengambil statistik dan rasio keterlambatan per supervisor (BR-21). */
  async getSupervisorLateness(
    params: SupervisorLatenessParams = {},
  ): Promise<SupervisorLatenessItem[]> {
    const res = await api.get<ApiResponse<SupervisorLatenessItem[]>>(
      "/dashboard/supervisor-lateness",
      { params },
    );
    return res.data.data;
  },

  /** Membuka kunci manual untuk area yang tertunggak > 3 hari kerja (US-11, BR-22). */
  async unlockArea(areaId: string, payload: UnlockAreaPayload): Promise<UnlockAreaResponse> {
    const res = await api.post<ApiResponse<UnlockAreaResponse>>(
      `/reports/areas/${areaId}/unlock`,
      payload,
    );
    return res.data.data;
  },
};
