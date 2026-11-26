export type PayeeType = "FREELANCE" | "AGENT";
export type PaymentStatus = "PAID" | "UNPAID";
export type PaymentProofMime = "image/jpeg" | "image/png";

export interface PaymentProofPayload {
  storedFileId: string;
  fileName: string;
  mimeType: PaymentProofMime;
  sizeBytes: number;
}

export interface PaymentPayeeSummary {
  recordCount: number;
  paidCount: number;
  unpaidCount: number;
  totalPaid: number;
  totalUnpaid: number;
  latestRecordDate: string | null;
}

export interface PaymentPayeeItem {
  id: string;
  type: PayeeType;
  name: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  summary: PaymentPayeeSummary;
}

export interface PaymentRecordItem {
  id: string;
  payeeId: string;
  status: PaymentStatus;
  amount: number;
  recordDate: string;
  dueDate: string | null;
  proofStoredFileId: string | null;
  proofFileName: string | null;
  proofMimeType: string | null;
  proofSizeBytes: number | null;
  proofContentPath: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayeePayload {
  type: PayeeType;
  name: string;
  phone?: string | null;
}

export interface CreatePaymentRecordPayload {
  status: PaymentStatus;
  amount: number;
  recordDate: string;
  dueDate?: string | null;
  proof?: PaymentProofPayload | null;
}

export interface UpdatePaymentRecordPayload {
  status?: PaymentStatus;
  amount?: number;
  recordDate?: string;
  dueDate?: string | null;
  proof?: PaymentProofPayload | null;
}

export interface PaymentPeopleFilterParams {
  type?: PayeeType;
  search?: string;
}

export interface PaymentRecordsFilterParams {
  status?: PaymentStatus;
}
