import axios from "axios";
import type { ApiResponse } from "@/types/api";
import type {
  CreateDrawingPayload,
  DrawingFilterParams,
  DrawingItem,
  DrawingMimeType,
  SignedDrawingUploadResponse,
} from "@/types/api/drawing.types";
import { api } from "./axios";
import { apiSurfacePath, type ApiSurface } from "./api-surface";

export const drawingApi = {
  /** Mengambil galeri Drawing project dengan hydrated signed viewUrl (US-18, BR-32). */
  async getDrawings(
    projectId: string,
    params?: DrawingFilterParams,
    surface: ApiSurface = "office",
  ): Promise<DrawingItem[]> {
    const response = await api.get<ApiResponse<DrawingItem[]>>(
      apiSurfacePath(surface, `/projects/${projectId}/drawings`),
      {
        params: params?.includeArchived ? { includeArchived: "true" } : undefined,
      },
    );
    return response.data.data;
  },

  /** Menyimpan metadata Drawing baru oleh OWNER (US-18, BR-32, BR-33). */
  async createDrawing(
    projectId: string,
    payload: CreateDrawingPayload,
  ): Promise<DrawingItem> {
    const response = await api.post<ApiResponse<DrawingItem>>(
      apiSurfacePath("office", `/projects/${projectId}/drawings`),
      payload,
    );
    return response.data.data;
  },

  /** Mengarsipkan Drawing oleh OWNER (US-18, BR-32). */
  async archiveDrawing(drawingId: string): Promise<DrawingItem> {
    const response = await api.post<ApiResponse<DrawingItem>>(
      apiSurfacePath("office", `/drawings/${drawingId}/archive`),
    );
    return response.data.data;
  },

  /** Meminta presigned PUT URL untuk unggah Drawing (purpose "drawing", BR-33). */
  async signDrawingUpload(params: {
    projectId: string;
    fileName: string;
    contentType: DrawingMimeType;
    fileSizeBytes: number;
  }): Promise<SignedDrawingUploadResponse> {
    const response = await api.post<ApiResponse<SignedDrawingUploadResponse>>(apiSurfacePath("office", "/uploads/sign"), {
      purpose: "drawing",
      projectId: params.projectId,
      file: {
        fileName: params.fileName,
        contentType: params.contentType,
        fileSizeBytes: params.fileSizeBytes,
      },
    });
    return response.data.data;
  },

  /** Mengunggah file Drawing terkompresi langsung ke R2 (ADR-02). */
  async uploadDrawingToSignedUrl(params: {
    uploadUrl: string;
    file: Blob;
    contentType: DrawingMimeType;
  }): Promise<void> {
    await axios.put(params.uploadUrl, params.file, {
      headers: { "Content-Type": params.contentType },
      timeout: 60_000,
    });
  },
};
