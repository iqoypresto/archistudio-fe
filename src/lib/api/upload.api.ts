import axios from "axios";
import type { ApiResponse } from "@/types/api";
import type {
  SignedPhotoViewItem,
  SignedUploadUrlItem,
  SignUploadPayload,
  SupportedImageMime,
  ViewUrlsPayload,
} from "@/types/api/upload.types";
import { api } from "./axios";

export class UploadApi {
  async signUploadUrls(payload: SignUploadPayload): Promise<SignedUploadUrlItem[]> {
    const res = await api.post<ApiResponse<SignedUploadUrlItem[]>>(
      "/field/uploads/sign",
      payload
    );
    return res.data.data;
  }

  async putFileToSignedUrl(params: {
    uploadUrl: string;
    file: Blob;
    contentType: SupportedImageMime;
    onProgress?: (percent: number) => void;
  }): Promise<void> {
    await axios.put(params.uploadUrl, params.file, {
      headers: { "Content-Type": params.contentType },
      timeout: 60_000,
      onUploadProgress: (event) => {
        if (!params.onProgress || !event.total) return;
        const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
        params.onProgress(percent);
      },
    });
  }

  async getReportViewUrls(payload: ViewUrlsPayload): Promise<SignedPhotoViewItem[]> {
    const res = await api.post<ApiResponse<SignedPhotoViewItem[]>>(
      "/field/uploads/view-urls",
      payload
    );
    return res.data.data;
  }
}

export const uploadApi = new UploadApi();
