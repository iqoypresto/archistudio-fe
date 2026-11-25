import axios from "axios";
import type { ApiResponse } from "@/types/api";
import type {
  CreatePayeePayload,
  CreatePaymentRecordPayload,
  PaymentPayeeItem,
  PaymentPeopleFilterParams,
  PaymentProofMime,
  PaymentRecordItem,
  PaymentRecordsFilterParams,
  SignedPaymentProofResponse,
  UpdatePaymentRecordPayload,
} from "@/types/api/payment.types";
import { api } from "./axios";

export const paymentApi = {
  /** Mengambil daftar penerima pembayaran Freelance/Agent global (US-17, BR-36). */
  async getPeople(params?: PaymentPeopleFilterParams): Promise<PaymentPayeeItem[]> {
    const response = await api.get<ApiResponse<PaymentPayeeItem[]>>("/office/payments/people", {
      params,
    });
    return response.data.data;
  },

  /** Menambahkan penerima pembayaran Freelance/Agent baru (US-17, BR-36). */
  async createPerson(payload: CreatePayeePayload): Promise<PaymentPayeeItem> {
    const response = await api.post<ApiResponse<PaymentPayeeItem>>("/office/payments/people", payload);
    return response.data.data;
  },

  /** Mengambil daftar catatan pembayaran per orang beserta proofViewUrl (US-17, BR-36). */
  async getRecords(
    personId: string,
    params?: PaymentRecordsFilterParams,
  ): Promise<PaymentRecordItem[]> {
    const response = await api.get<ApiResponse<PaymentRecordItem[]>>(
      `/office/payments/people/${personId}/records`,
      { params },
    );
    return response.data.data;
  },

  /** Menambahkan catatan pembayaran baru untuk penerima tertentu (US-17, BR-36). */
  async createRecord(
    personId: string,
    payload: CreatePaymentRecordPayload,
  ): Promise<PaymentRecordItem> {
    const response = await api.post<ApiResponse<PaymentRecordItem>>(
      `/office/payments/people/${personId}/records`,
      payload,
    );
    return response.data.data;
  },

  /** Memperbarui catatan pembayaran yang ada (US-17, BR-36). */
  async updateRecord(
    recordId: string,
    payload: UpdatePaymentRecordPayload,
  ): Promise<PaymentRecordItem> {
    const response = await api.patch<ApiResponse<PaymentRecordItem>>(
      `/office/payments/records/${recordId}`,
      payload,
    );
    return response.data.data;
  },

  /** Meminta presigned PUT URL untuk bukti pembayaran (JPG/PNG maks. 2 MB) (BR-36). */
  async signProofUpload(params: {
    payeeId: string;
    fileName: string;
    contentType: PaymentProofMime;
    fileSizeBytes: number;
  }): Promise<SignedPaymentProofResponse> {
    const response = await api.post<ApiResponse<SignedPaymentProofResponse>>("/office/uploads/sign", {
      purpose: "payment-proof",
      payeeId: params.payeeId,
      file: {
        fileName: params.fileName,
        contentType: params.contentType,
        fileSizeBytes: params.fileSizeBytes,
      },
    });
    return response.data.data;
  },

  /** Mengunggah berkas bukti langsung ke presigned URL R2 (ADR-02). */
  async uploadProofToSignedUrl(params: {
    uploadUrl: string;
    file: Blob;
    contentType: PaymentProofMime;
  }): Promise<void> {
    await axios.put(params.uploadUrl, params.file, {
      headers: { "Content-Type": params.contentType },
      timeout: 60_000,
    });
  },
};
