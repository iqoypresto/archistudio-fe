import type { ApiResponse } from "@/types/api";
import type {
  CommsEntryItem,
  CommsFilterParams,
  CreateCommsPayload,
  UpdateCommsPayload,
} from "@/types/api/comms.types";
import type { UploadFileMime } from "@/types/api/upload.types";
import { api } from "./axios";
import { apiSurfacePath, type ApiSurface } from "./api-surface";
import { uploadApi } from "./upload.api";

function apiPayload<T extends CreateCommsPayload | UpdateCommsPayload>(payload: T) {
  return {
    ...payload,
    ...(payload.attachment && { attachment: { storedFileId: payload.attachment.storedFileId } }),
  };
}

export const commsApi = {
  async getEntries(projectId: string, params?: CommsFilterParams, surface: ApiSurface = "office"): Promise<CommsEntryItem[]> {
    const response = await api.get<ApiResponse<CommsEntryItem[]>>(apiSurfacePath(surface, `/projects/${projectId}/comms`), { params });
    return response.data.data;
  },

  async createEntry(projectId: string, payload: CreateCommsPayload, surface: ApiSurface = "office"): Promise<CommsEntryItem> {
    const response = await api.post<ApiResponse<CommsEntryItem>>(
      apiSurfacePath(surface, `/projects/${projectId}/comms`), apiPayload(payload),
    );
    return response.data.data;
  },

  async updateEntry(commsId: string, payload: UpdateCommsPayload, surface: ApiSurface = "office"): Promise<CommsEntryItem> {
    const response = await api.patch<ApiResponse<CommsEntryItem>>(
      apiSurfacePath(surface, `/comms/${commsId}`), apiPayload(payload),
    );
    return response.data.data;
  },

  async uploadAttachment(projectId: string, file: File, surface: ApiSurface = "office") {
    return uploadApi.uploadFile(
      { purpose: "comms-attachment", projectId }, file, file.type as UploadFileMime,
      undefined, file.name, surface,
    );
  },
};
