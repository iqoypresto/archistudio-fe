import axios from "axios";
import type { ApiResponse } from "@/types/api";
import type {
  CreateProjectDocumentPayload,
  ProjectDocumentFilterParams,
  ProjectDocumentItem,
  ProjectDocumentType,
  SignedProjectDocumentUploadResponse,
} from "@/types/api/project-document.types";
import { api } from "./axios";

export const projectDocumentApi = {
  /** Mengambil daftar dokumen keluar project dengan hydrated signed URL (US-19, BR-34). */
  async getDocuments(
    projectId: string,
    params?: ProjectDocumentFilterParams,
  ): Promise<ProjectDocumentItem[]> {
    const response = await api.get<ApiResponse<ProjectDocumentItem[]>>(
      `/projects/${projectId}/documents`,
      { params },
    );
    return response.data.data;
  },

  /** Menyimpan metadata file dokumen keluar baru oleh OWNER (US-19, BR-34). */
  async createDocument(
    projectId: string,
    payload: CreateProjectDocumentPayload,
  ): Promise<ProjectDocumentItem> {
    const response = await api.post<ApiResponse<ProjectDocumentItem>>(
      `/projects/${projectId}/documents`,
      payload,
    );
    return response.data.data;
  },

  /** Menghapus permanen file dokumen keluar (DB + R2) oleh OWNER (US-19, BR-34). */
  async deleteDocument(documentId: string): Promise<{ id: string; deleted: true }> {
    const response = await api.delete<ApiResponse<{ id: string; deleted: true }>>(
      `/documents/${documentId}`,
    );
    return response.data.data;
  },

  /** Meminta presigned PUT URL untuk unggah dokumen keluar (purpose "project-document", BR-34). */
  async signDocumentUpload(params: {
    projectId: string;
    type: ProjectDocumentType;
    fileName: string;
    contentType: string;
    fileSizeBytes: number;
  }): Promise<SignedProjectDocumentUploadResponse> {
    const response = await api.post<ApiResponse<SignedProjectDocumentUploadResponse>>(
      "/uploads/sign",
      {
        purpose: "project-document",
        projectId: params.projectId,
        type: params.type,
        file: {
          fileName: params.fileName,
          contentType: params.contentType,
          fileSizeBytes: params.fileSizeBytes,
        },
      },
    );
    return response.data.data;
  },

  /** Mengunggah dokumen langsung ke presigned URL R2 (ADR-02). */
  async uploadDocumentToSignedUrl(params: {
    uploadUrl: string;
    file: Blob;
    contentType: string;
  }): Promise<void> {
    await axios.put(params.uploadUrl, params.file, {
      headers: { "Content-Type": params.contentType },
      timeout: 60_000,
    });
  },
};
