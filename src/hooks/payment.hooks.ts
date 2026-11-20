import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentApi } from "@/lib/api/payment.api";
import { validatePaymentProofFile } from "@/lib/validation/payment.validation";
import type {
  CreatePayeePayload,
  CreatePaymentRecordPayload,
  PaymentPeopleFilterParams,
  PaymentProofPayload,
  PaymentRecordsFilterParams,
  UpdatePaymentRecordPayload,
} from "@/types/api/payment.types";

export const PAYMENTS_QUERY_KEY = ["payments"] as const;

export function usePaymentPeopleQuery(
  params: PaymentPeopleFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...PAYMENTS_QUERY_KEY, "people", params],
    queryFn: () => paymentApi.getPeople(params),
    enabled: options?.enabled ?? true,
  });
}

export function usePayeeRecordsQuery(
  personId: string | null,
  params?: PaymentRecordsFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...PAYMENTS_QUERY_KEY, "records", personId, params ?? {}],
    queryFn: () => (personId ? paymentApi.getRecords(personId, params) : []),
    enabled: Boolean(personId) && (options?.enabled ?? true),
  });
}

export function useCreatePayeeMutation(onSuccessCallback?: (createdId: string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePayeePayload) => paymentApi.createPerson(payload),
    onSuccess: (created) => {
      toast.success(`${created.name} berhasil ditambahkan.`);
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      onSuccessCallback?.(created.id);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan data penerima pembayaran.");
    },
  });
}

export function useCreatePaymentRecordMutation(
  personId: string | null,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePaymentRecordPayload) => {
      if (!personId) throw new Error("Pilih orang terlebih dahulu.");
      return paymentApi.createRecord(personId, payload);
    },
    onSuccess: () => {
      toast.success("Catatan pembayaran berhasil disimpan.");
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menyimpan catatan pembayaran.");
    },
  });
}

export function useUpdatePaymentRecordMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recordId,
      payload,
    }: {
      recordId: string;
      payload: UpdatePaymentRecordPayload;
    }) => paymentApi.updateRecord(recordId, payload),
    onSuccess: () => {
      toast.success("Catatan pembayaran berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui catatan pembayaran.");
    },
  });
}

export function usePaymentProofUpload(payeeId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<PaymentProofPayload | null> => {
    const check = validatePaymentProofFile(file);
    if (!check.valid) {
      setErrorMessage(check.message);
      return null;
    }
    setErrorMessage(null);
    setIsUploading(true);
    try {
      const signed = await paymentApi.signProofUpload({
        payeeId,
        fileName: file.name,
        contentType: check.mimeType,
        fileSizeBytes: file.size,
      });
      await paymentApi.uploadProofToSignedUrl({
        uploadUrl: signed.uploadUrl,
        file,
        contentType: check.mimeType,
      });
      return {
        storageKey: signed.storageKey,
        fileName: file.name,
        mimeType: check.mimeType,
        sizeBytes: file.size,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal mengunggah bukti pembayaran.";
      setErrorMessage(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, errorMessage, clearError: () => setErrorMessage(null) };
}
