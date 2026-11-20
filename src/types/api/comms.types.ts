export type CommsDirection = "INBOUND" | "OUTBOUND";

export interface CommsAttachmentPayload {
  storageKey: string;
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
  attachmentKey: string | null;
  attachmentName: string | null;
  attachmentMime: string | null;
  attachmentBytes: number | null;
  attachmentViewUrl: string | null;
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

export interface SignedCommsAttachmentResponse {
  uploadUrl: string;
  storageKey: string;
  expiresInSeconds: number;
  purpose: "comms-attachment";
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
}
