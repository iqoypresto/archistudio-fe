import { api } from "./axios";
import { apiSurfacePath, type ApiSurface } from "./api-surface";
import type { ApiResponse } from "@/types/api";
import type {
  ArchivedProjectItem,
  ArchiveFilterParams,
  CreateProjectPayload,
  PaginatedProjectsResponse,
  ProjectDetail,
  ProjectFilterParams,
  ProjectListItem,
  RestoreProjectPayload,
  UpdateProjectPayload,
} from "@/types/api/project.types";

export const projectApi = {
  /** Mengambil daftar project aktif berpaginasi (US-04). */
  async getProjects(
    params?: ProjectFilterParams,
    surface: ApiSurface = "office",
  ): Promise<PaginatedProjectsResponse> {
    const response = await api.get<PaginatedProjectsResponse>(apiSurfacePath(surface, "/projects"), {
      params,
    });
    return response.data;
  },

  /** Mengambil daftar Archive Project untuk OWNER/ADMIN (US-22, BR-39). */
  async getArchivedProjects(params?: ArchiveFilterParams): Promise<ArchivedProjectItem[]> {
    const response = await api.get<ApiResponse<ArchivedProjectItem[]>>("/office/projects/archive", {
      params,
    });
    return response.data.data;
  },

  /** Mengambil detail project berdasarkan ID (US-04). */
  async getProjectById(id: string, surface: ApiSurface = "office"): Promise<ProjectDetail> {
    const response = await api.get<ApiResponse<ProjectDetail>>(apiSurfacePath(surface, `/projects/${id}`));
    return response.data.data;
  },

  /** Membuat master project baru (US-04, AC-04.1). */
  async createProject(payload: CreateProjectPayload): Promise<ProjectListItem> {
    const response = await api.post<ApiResponse<ProjectListItem>>("/office/projects", payload);
    return response.data.data;
  },

  /** Memperbarui master project aktif (US-04). */
  async updateProject(id: string, payload: UpdateProjectPayload): Promise<ProjectListItem> {
    const response = await api.patch<ApiResponse<ProjectListItem>>(`/office/projects/${id}`, payload);
    return response.data.data;
  },

  /** Menandai project SELESAI & masuk Archive oleh OWNER (US-22, BR-12, BR-39). */
  async completeProject(id: string): Promise<ProjectListItem> {
    const response = await api.post<ApiResponse<ProjectListItem>>(`/office/projects/${id}/complete`);
    return response.data.data;
  },

  /** Mengarsipkan project secara manual oleh OWNER (US-22, BR-39). */
  async archiveProject(id: string): Promise<ProjectListItem> {
    const response = await api.post<ApiResponse<ProjectListItem>>(`/office/projects/${id}/archive`);
    return response.data.data;
  },

  /** Memulihkan project dari Archive ke status pilihan OWNER (US-22, BR-39). */
  async restoreProject(
    id: string,
    payload: RestoreProjectPayload,
  ): Promise<ProjectListItem> {
    const response = await api.post<ApiResponse<ProjectListItem>>(
      `/office/projects/${id}/restore`,
      payload,
    );
    return response.data.data;
  },
};
