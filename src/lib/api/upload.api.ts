import type { ApiResponse } from "@/types/api";
import type {
  CompletedStoredFile,
  UploadFileMime,
  UploadSessionPayload,
  UploadSessionReceipt,
  UploadSessionStatus,
  UploadSessionTarget,
} from "@/types/api/upload.types";
import { apiSurfacePath, type ApiSurface } from "./api-surface";
import { api } from "./axios";

export class UploadApi {
  async createSession(payload: UploadSessionPayload, surface?: ApiSurface): Promise<UploadSessionReceipt> {
    const response = await api.post<ApiResponse<UploadSessionReceipt>>(this.sessionsPath(payload, surface), payload);
    return response.data.data;
  }

  async getStatus(uploadSessionId: string, surface: ApiSurface = "office"): Promise<UploadSessionStatus> {
    const response = await api.get<ApiResponse<UploadSessionStatus>>(
      `${apiSurfacePath(surface, "/uploads/sessions")}/${uploadSessionId}`,
    );
    return response.data.data;
  }

  async cancelSession(uploadSessionId: string, surface: ApiSurface = "office"): Promise<void> {
    await api.delete(`${apiSurfacePath(surface, "/uploads/sessions")}/${uploadSessionId}`);
  }

  async uploadFile(
    payload: UploadSessionTarget,
    file: Blob & { name?: string },
    contentType: UploadFileMime,
    onProgress?: (percent: number) => void,
    fileName?: string,
    surface?: ApiSurface,
    onSessionCreated?: (receipt: UploadSessionReceipt) => void,
  ): Promise<CompletedStoredFile> {
    const resolvedSurface = surface ?? this.defaultSurface(payload);
    const receipt = await this.createSession({
      ...payload,
      file: {
        fileName: fileName || file.name || "upload",
        contentType,
        fileSizeBytes: file.size,
      },
    } as UploadSessionPayload, resolvedSurface);
    onSessionCreated?.(receipt);

    try {
      let status = await this.getStatus(receipt.uploadSessionId, resolvedSurface);
      while (status.nextOffsetBytes < file.size) {
        const start = status.nextOffsetBytes;
        const endExclusive = Math.min(start + receipt.chunkSizeBytes, file.size);
        const chunk = file.slice(start, endExclusive);
        try {
          await api.put<ApiResponse<{ nextOffsetBytes: number }>>(
            `${this.sessionsPath(payload, resolvedSurface)}/${receipt.uploadSessionId}/chunks`,
            chunk,
            {
              headers: {
                "Content-Type": "application/octet-stream",
                "Content-Range": `bytes ${start}-${endExclusive - 1}/${file.size}`,
              },
              timeout: 60_000,
              onUploadProgress: (event) => {
                if (!onProgress) return;
                const sent = Math.min(endExclusive - start, event.loaded);
                onProgress(Math.min(99, Math.round(((start + sent) / file.size) * 100)));
              },
            },
          );
        } catch (uploadError) {
          const reconciled = await this.getStatus(receipt.uploadSessionId, resolvedSurface).catch(() => null);
          if (!reconciled || reconciled.nextOffsetBytes <= start) throw uploadError;
        }
        status = await this.getStatus(receipt.uploadSessionId, resolvedSurface);
      }

      const response = await api.post<ApiResponse<CompletedStoredFile>>(
        `${this.sessionsPath(payload, resolvedSurface)}/${receipt.uploadSessionId}/complete`,
      );
      onProgress?.(100);
      return response.data.data;
    } catch (error) {
      await this.cancelSession(receipt.uploadSessionId, resolvedSurface).catch(() => undefined);
      throw error;
    }
  }

  private defaultSurface(payload: UploadSessionTarget): ApiSurface {
    return "reportSessionId" in payload ? "field" : "office";
  }

  private sessionsPath(payload: UploadSessionTarget | UploadSessionPayload, surface?: ApiSurface): string {
    const resolvedSurface = surface ?? ("reportSessionId" in payload ? "field" : "office");
    return apiSurfacePath(resolvedSurface, "/uploads/sessions");
  }
}

export const uploadApi = new UploadApi();
