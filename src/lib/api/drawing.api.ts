import axios from "axios";
import type { ApiResponse } from "@/types/api";
import type {
  CreateDrawingPayload,
  DrawingDirection,
  DrawingFilterParams,
  DrawingItem,
  DrawingMimeType,
  SignedDrawingUploadResponse,
} from "@/types/api/drawing.types";
import { api } from "./axios";

export const drawingApi = {
  /** Mengambil galeri Drawing project dengan hydrated signed viewUrl (US-18, BR-32). */
  async getDrawings(
    projectId: string,
    params?: DrawingFilterParams,
  ): Promise<DrawingItem[]> {
    const response = await api.get<ApiResponse<DrawingItem[]>>(
      `/projects/${projectId}/drawings`,
      {
        params: params
          ? {
              ...(params.direction && { direction: params.direction }),
              ...(params.includeArchived && { includeArchived: "true" }),
            }
          : undefined,
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
      `/projects/${projectId}/drawings`,
      payload,
    );
    return response.data.data;
  },

  /** Mengarsipkan Drawing oleh OWNER (US-18, BR-32). */
  async archiveDrawing(drawingId: string): Promise<DrawingItem> {
    const response = await api.post<ApiResponse<DrawingItem>>(
      `/drawings/${drawingId}/archive`,
    );
    return response.data.data;
  },

  /** Meminta presigned PUT URL ke R2 untuk unggah Drawing (purpose "drawing", BR-33). */
  async signDrawingUpload(params: {
    projectId: string;
    direction: DrawingDirection;
    fileName: string;
    contentType: DrawingMimeType;
    fileSizeBytes: number;
  }): Promise<SignedDrawingUploadResponse> {
    const response = await api.post<ApiResponse<SignedDrawingUploadResponse>>("/uploads/sign", {
      purpose: "drawing",
      projectId: params.projectId,
      direction: params.direction,
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
