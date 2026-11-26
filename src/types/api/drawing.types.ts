export type DrawingMimeType = "image/jpeg" | "image/png" | "image/webp";

export interface DrawingItem {
  id: string;
  projectId: string;
  storedFileId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string | null;
  archivedAt: string | null;
  contentPath: string;
}

export interface CreateDrawingPayload {
  storedFileId: string;
}

export interface DrawingFilterParams {
  includeArchived?: boolean;
}
