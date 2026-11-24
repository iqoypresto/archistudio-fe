export type SupportedImageMime = "image/jpeg" | "image/png" | "image/webp";

export interface SignUploadFileRequest {
  contentType: SupportedImageMime;
  fileSizeBytes: number;
}

export interface SignUploadPayload {
  areaId: string;
  reportDate: string;
  sessionId?: string;
  files: SignUploadFileRequest[];
}

export interface SignedUploadUrlItem {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
}

export interface ViewUrlsPayload {
  reportId: string;
}

export interface SignedPhotoViewItem {
  photoId: string;
  viewUrl: string;
  caption: string | null;
  sortOrder: number;
  takenAt: string | null;
  uploadedAt: string | null;
}

export type UploadQueueStatus =
  | "idle"
  | "local"
  | "compressing"
  | "signing"
  | "uploading"
  | "uploaded"
  | "failed";

export interface PhotoQueueItem {
  id: string;
  fileName: string;
  contentType: SupportedImageMime;
  previewUrl: string;
  file: Blob | null;
  status: UploadQueueStatus;
  progress: number;
  caption: string;
  storageKey: string | null;
  takenAt: string | null;
  errorMessage: string | null;
}
