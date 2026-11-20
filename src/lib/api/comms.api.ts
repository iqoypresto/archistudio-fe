import axios from "axios";
import type { ApiResponse } from "@/types/api";
import type {
  CommsEntryItem,
  CommsFilterParams,
  CreateCommsPayload,
  SignedCommsAttachmentResponse,
  UpdateCommsPayload,
} from "@/types/api/comms.types";
import { api } from "./axios";

export const commsApi = {
  /** Mengambil daftar catatan Comms project dengan hydrated attachmentViewUrl (US-20, BR-35). */
  async getEntries(projectId: string, params?: CommsFilterParams): Promise<CommsEntryItem[]> {
    const response = await api.get<ApiResponse<CommsEntryItem[]>>(
      `/projects/${projectId}/comms`,
      { params },
    );
    return response.data.data;
  },

  /** Menambahkan catatan Comms baru oleh OWNER (US-20, AC-20.1, BR-35). */
  async createEntry(projectId: string, payload: CreateCommsPayload): Promise<CommsEntryItem> {
    const response = await api.post<ApiResponse<CommsEntryItem>>(
      `/projects/${projectId}/comms`,
      payload,
    );
    return response.data.data;
  },

  /** Memperbarui catatan Comms oleh OWNER (US-20, BR-35). */
  async updateEntry(commsId: string, payload: UpdateCommsPayload): Promise<CommsEntryItem> {
    const response = await api.patch<ApiResponse<CommsEntryItem>>(`/comms/${commsId}`, payload);
    return response.data.data;
  },

  /** Meminta presigned PUT URL untuk 1 lampiran opsional Comms (purpose "comms-attachment", BR-35). */
  async signAttachmentUpload(params: {
    projectId: string;
    fileName: string;
    contentType: string;
    fileSizeBytes: number;
  }): Promise<SignedCommsAttachmentResponse> {
    const response = await api.post<ApiResponse<SignedCommsAttachmentResponse>>("/uploads/sign", {
      purpose: "comms-attachment",
      projectId: params.projectId,
      file: {
        fileName: params.fileName,
        contentType: params.contentType,
        fileSizeBytes: params.fileSizeBytes,
      },
    });
    return response.data.data;
  },

  /** Mengunggah berkas lampiran langsung ke presigned URL R2 (ADR-02). */
  async uploadAttachmentToSignedUrl(params: {
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
