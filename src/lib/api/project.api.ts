import { api } from "./axios";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CreateProjectPayload,
  ProjectDetail,
  ProjectFilterParams,
  ProjectListItem,
  UpdateProjectPayload,
} from "@/types/api/project.types";

export const projectApi = {
  /** Mengambil daftar project berpaginasi (US-04). */
  async getProjects(
    params?: ProjectFilterParams,
  ): Promise<PaginatedResponse<ProjectListItem>> {
    const response = await api.get<PaginatedResponse<ProjectListItem>>("/projects", {
      params,
    });
    return response.data;
  },

  /** Mengambil detail project berdasarkan ID (US-04). */
  async getProjectById(id: string): Promise<ProjectDetail> {
    const response = await api.get<ApiResponse<ProjectDetail>>(`/projects/${id}`);
    return response.data.data;
  },

  /** Membuat master project baru (US-04, AC-04.1). */
  async createProject(payload: CreateProjectPayload): Promise<ProjectListItem> {
    const response = await api.post<ApiResponse<ProjectListItem>>("/projects", payload);
    return response.data.data;
  },

  /** Memperbarui master project (US-04). */
  async updateProject(
    id: string,
    payload: UpdateProjectPayload,
  ): Promise<ProjectListItem> {
    const response = await api.patch<ApiResponse<ProjectListItem>>(
      `/projects/${id}`,
      payload,
    );
    return response.data.data;
  },

  /** Mengarsipkan project secara soft-delete (BR-05, NFR-05). */
  async archiveProject(
    id: string,
  ): Promise<{ id: string; deletedAt: string }> {
    const response = await api.patch<ApiResponse<{ id: string; deletedAt: string }>>(
      `/projects/${id}/archive`,
    );
    return response.data.data;
  },
};
