export interface ProjectFilePreviewItem {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string | null;
  contentPath: string;
  secondaryLabel?: string;
}
