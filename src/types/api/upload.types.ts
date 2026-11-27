export type SupportedImageMime = "image/jpeg" | "image/png" | "image/webp";
export type UploadFileMime = SupportedImageMime | "application/pdf" | "application/msword" |
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.ms-excel" |
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export type ProjectDocumentType = "QUOTATION" | "BAST" | "INVOICE";

export interface UploadFileDescriptor {
  fileName: string;
  contentType: UploadFileMime;
  fileSizeBytes: number;
}

export type UploadSessionPayload =
  | { reportSessionId: string; areaId: string; reportDate: string; photoOrder: number; file: UploadFileDescriptor }
  | { purpose: "report-photo"; reportId: string; file: UploadFileDescriptor }
  | { purpose: "payment-proof"; payeeId: string; file: UploadFileDescriptor }
  | { purpose: "drawing"; projectId: string; file: UploadFileDescriptor }
  | { purpose: "project-document"; projectId: string; type: ProjectDocumentType; file: UploadFileDescriptor }
  | { purpose: "comms-attachment"; projectId: string; file: UploadFileDescriptor };
export type UploadSessionTarget = UploadSessionPayload extends infer P
  ? P extends { file: UploadFileDescriptor }
    ? Omit<P, "file">
    : never
  : never;

export interface UploadSessionReceipt {
  storedFileId: string;
  uploadSessionId: string;
  chunkSizeBytes: number;
  expiresAt: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
}

export interface CompletedStoredFile {
  storedFileId: string;
  uploadSessionId: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface UploadSessionStatus {
  status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";
  nextOffsetBytes: number;
  totalBytes: number;
  expiresAt: string;
}

export type UploadQueueStatus = "idle" | "local" | "compressing" | "signing" | "uploading" | "uploaded" | "failed";

export interface PhotoQueueItem {
  id: string;
  fileName: string;
  contentType: SupportedImageMime;
  previewUrl: string;
  file: Blob | null;
  status: UploadQueueStatus;
  progress: number;
  caption: string;
  storedFileId: string | null;
  uploadSessionId: string | null;
  takenAt: string | null;
  errorMessage: string | null;
}
