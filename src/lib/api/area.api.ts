import { api } from "./axios";
import type { ApiResponse } from "@/types/api";
import { apiSurfacePath, type ApiSurface } from "./api-surface";
import type {
  ActiveAssignmentInfo,
  AreaListItem,
  AssignSupervisorPayload,
  AssignmentHistoryItem,
  CreateAreaPayload,
  UpdateAreaPayload,
} from "@/types/api/area.types";

export const areaApi = {
  /** Mengambil daftar area dalam project beserta penugasan aktif (US-05). */
  async getAreasByProject(projectId: string, surface: ApiSurface = "office"): Promise<AreaListItem[]> {
    const response = await api.get<ApiResponse<AreaListItem[]>>(
      apiSurfacePath(surface, `/projects/${projectId}/areas`),
    );
    return response.data.data;
  },

  /** Menambahkan area baru ke dalam project (US-05, AC-05.1). */
  async createArea(
    projectId: string,
    payload: CreateAreaPayload,
  ): Promise<AreaListItem> {
    const response = await api.post<ApiResponse<AreaListItem>>(
      `/office/projects/${projectId}/areas`,
      payload,
    );
    return response.data.data;
  },

  /** Memperbarui data area (US-05). */
  async updateArea(
    areaId: string,
    payload: UpdateAreaPayload,
  ): Promise<AreaListItem> {
    const response = await api.patch<ApiResponse<AreaListItem>>(
      `/office/areas/${areaId}`,
      payload,
    );
    return response.data.data;
  },

  /** Menugaskan atau mengganti supervisor aktif (US-06, AC-06.1). */
  async assignSupervisor(
    areaId: string,
    payload: AssignSupervisorPayload,
  ): Promise<ActiveAssignmentInfo> {
    const response = await api.post<ApiResponse<ActiveAssignmentInfo>>(
      `/office/areas/${areaId}/assignments`,
      payload,
    );
    return response.data.data;
  },

  /** Mengambil riwayat kronologis penugasan supervisor (US-06). */
  async getAssignmentHistory(areaId: string): Promise<AssignmentHistoryItem[]> {
    const response = await api.get<ApiResponse<AssignmentHistoryItem[]>>(
      `/office/areas/${areaId}/assignments`,
    );
    return response.data.data;
  },
};
