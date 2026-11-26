import type { UserRole } from "./auth.types";

export type CommsDirection = "INBOUND" | "OUTBOUND";

export interface CommsActorSummary {
  id: string;
  name: string;
  role: UserRole;
}

export interface CommsAttachmentPayload {
  storedFileId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface CommsEntryItem {
  id: string;
  projectId: string;
  direction: CommsDirection;
  entryDate: string;
  subject: string;
  note: string | null;
  attachmentStoredFileId: string | null;
  attachmentName: string | null;
  attachmentMime: string | null;
  attachmentBytes: number | null;
  attachmentContentPath: string | null;
  createdBy: CommsActorSummary;
  updatedBy: CommsActorSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommsPayload {
  entryDate: string;
  direction: CommsDirection;
  subject: string;
  note?: string | null;
  attachment?: CommsAttachmentPayload | null;
}

export interface UpdateCommsPayload {
  entryDate?: string;
  direction?: CommsDirection;
  subject?: string;
  note?: string | null;
  attachment?: CommsAttachmentPayload | null;
}

export interface CommsFilterParams {
  dateFrom?: string;
  dateTo?: string;
  direction?: CommsDirection;
  search?: string;
}
