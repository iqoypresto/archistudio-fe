import type { ProjectDocumentType } from "./upload.types";
export type { ProjectDocumentType } from "./upload.types";


export interface ProjectDocumentItem {
  id: string;
  projectId: string;
  type: ProjectDocumentType;
  storedFileId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string | null;
  contentPath: string;
}

export interface CreateProjectDocumentPayload {
  type: ProjectDocumentType;
  storedFileId: string;
}

export interface ProjectDocumentFilterParams {
  type?: ProjectDocumentType;
}
