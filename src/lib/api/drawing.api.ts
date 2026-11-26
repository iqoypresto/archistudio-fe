import type { ApiResponse } from "@/types/api";
import type {
  CreateDrawingPayload,
  DrawingFilterParams,
  DrawingItem,
  DrawingMimeType,
} from "@/types/api/drawing.types";
import { uploadApi } from "./upload.api";
import { api } from "./axios";
import { apiSurfacePath, type ApiSurface } from "./api-surface";

export const drawingApi = {
  async getDrawings(projectId: string, params?: DrawingFilterParams, surface: ApiSurface = "office"): Promise<DrawingItem[]> {
    const response = await api.get<ApiResponse<DrawingItem[]>>(
      apiSurfacePath(surface, `/projects/${projectId}/drawings`),
      { params: params?.includeArchived ? { includeArchived: "true" } : undefined },
    );
    return response.data.data;
  },

  async createDrawing(projectId: string, payload: CreateDrawingPayload): Promise<DrawingItem> {
    const response = await api.post<ApiResponse<DrawingItem>>(`/office/projects/${projectId}/drawings`, payload);
    return response.data.data;
  },

  async archiveDrawing(drawingId: string): Promise<DrawingItem> {
    const response = await api.post<ApiResponse<DrawingItem>>(`/office/drawings/${drawingId}/archive`);
    return response.data.data;
  },

  async uploadDrawing(projectId: string, file: Blob, fileName: string, contentType: DrawingMimeType) {
    return uploadApi.uploadFile({ purpose: "drawing", projectId }, file, contentType, undefined, fileName);
  },
};
