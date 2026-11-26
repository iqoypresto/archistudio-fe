import type { ApiResponse } from "@/types/api";
import type {
  CreateProjectDocumentPayload,
  ProjectDocumentFilterParams,
  ProjectDocumentItem,
  ProjectDocumentType,
} from "@/types/api/project-document.types";
import type { UploadFileMime } from "@/types/api/upload.types";
import { api } from "./axios";
import { uploadApi } from "./upload.api";

export const projectDocumentApi = {
  async getDocuments(projectId: string, params?: ProjectDocumentFilterParams): Promise<ProjectDocumentItem[]> {
    const response = await api.get<ApiResponse<ProjectDocumentItem[]>>(`/office/projects/${projectId}/documents`, { params });
    return response.data.data;
  },

  async createDocument(projectId: string, payload: CreateProjectDocumentPayload): Promise<ProjectDocumentItem> {
    const response = await api.post<ApiResponse<ProjectDocumentItem>>(`/office/projects/${projectId}/documents`, payload);
    return response.data.data;
  },

  async deleteDocument(documentId: string): Promise<{ id: string; deleted: true }> {
    const response = await api.delete<ApiResponse<{ id: string; deleted: true }>>(`/office/documents/${documentId}`);
    return response.data.data;
  },

  async uploadDocument(projectId: string, type: ProjectDocumentType, file: File) {
    return uploadApi.uploadFile(
      { purpose: "project-document", projectId, type }, file, file.type as UploadFileMime, undefined, file.name,
    );
  },
};
