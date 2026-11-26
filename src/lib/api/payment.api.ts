import type { ApiResponse } from "@/types/api";
import type {
  CreatePayeePayload,
  CreatePaymentRecordPayload,
  PaymentPayeeItem,
  PaymentPeopleFilterParams,
  PaymentProofMime,
  PaymentRecordItem,
  PaymentRecordsFilterParams,
  UpdatePaymentRecordPayload,
} from "@/types/api/payment.types";
import { api } from "./axios";
import { uploadApi } from "./upload.api";

export const paymentApi = {
  async getPeople(params?: PaymentPeopleFilterParams): Promise<PaymentPayeeItem[]> {
    const response = await api.get<ApiResponse<PaymentPayeeItem[]>>("/office/payments/people", { params });
    return response.data.data;
  },

  async createPerson(payload: CreatePayeePayload): Promise<PaymentPayeeItem> {
    const response = await api.post<ApiResponse<PaymentPayeeItem>>("/office/payments/people", payload);
    return response.data.data;
  },

  async getRecords(personId: string, params?: PaymentRecordsFilterParams): Promise<PaymentRecordItem[]> {
    const response = await api.get<ApiResponse<PaymentRecordItem[]>>(`/office/payments/people/${personId}/records`, { params });
    return response.data.data;
  },

  async createRecord(personId: string, payload: CreatePaymentRecordPayload): Promise<PaymentRecordItem> {
    const body = { ...payload, ...(payload.proof && { proof: { storedFileId: payload.proof.storedFileId } }) };
    const response = await api.post<ApiResponse<PaymentRecordItem>>(`/office/payments/people/${personId}/records`, body);
    return response.data.data;
  },

  async updateRecord(recordId: string, payload: UpdatePaymentRecordPayload): Promise<PaymentRecordItem> {
    const body = {
      ...payload,
      ...(payload.proof !== undefined && { proof: payload.proof ? { storedFileId: payload.proof.storedFileId } : null }),
    };
    const response = await api.patch<ApiResponse<PaymentRecordItem>>(`/office/payments/records/${recordId}`, body);
    return response.data.data;
  },

  async uploadProof(payeeId: string, file: File, contentType: PaymentProofMime) {
    return uploadApi.uploadFile({ purpose: "payment-proof", payeeId }, file, contentType, undefined, file.name);
  },
};
