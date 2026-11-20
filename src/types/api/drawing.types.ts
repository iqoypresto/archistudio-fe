export type DrawingDirection = "IN" | "OUT";
export type DrawingMimeType = "image/jpeg" | "image/png" | "image/webp";

export interface DrawingItem {
  id: string;
  projectId: string;
  direction: DrawingDirection;
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  archivedAt: string | null;
  viewUrl: string;
}

export interface CreateDrawingPayload {
  direction: DrawingDirection;
  storageKey: string;
  fileName: string;
  mimeType: DrawingMimeType;
  sizeBytes: number;
}

export interface DrawingFilterParams {
  direction?: DrawingDirection;
  includeArchived?: boolean;
}

export interface SignedDrawingUploadResponse {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
  purpose: "drawing";
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
}
