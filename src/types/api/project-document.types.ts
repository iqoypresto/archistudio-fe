export type ProjectDocumentType = "QUOTATION" | "BAST" | "INVOICE";

export interface ProjectDocumentItem {
  id: string;
  projectId: string;
  type: ProjectDocumentType;
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  viewUrl: string;
}

export interface CreateProjectDocumentPayload {
  type: ProjectDocumentType;
  storageKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface ProjectDocumentFilterParams {
  type?: ProjectDocumentType;
}

export interface SignedProjectDocumentUploadResponse {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
  purpose: "project-document";
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
}
