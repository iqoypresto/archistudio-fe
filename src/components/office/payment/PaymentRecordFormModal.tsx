"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { usePaymentProofUpload } from "@/hooks/payment.hooks";
import {
  paymentRecordFormSchema,
  type PaymentRecordFormValues,
} from "@/lib/validation/payment.validation";
import type {
  CreatePaymentRecordPayload,
  PaymentProofMime,
  PaymentProofPayload,
  PaymentRecordItem,
  UpdatePaymentRecordPayload,
} from "@/types/api/payment.types";
import { PaymentProofField } from "./PaymentProofField";

interface PaymentRecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  payeeId: string;
  payeeName: string;
  recordToEdit: PaymentRecordItem | null;
  onSubmitCreate: (payload: CreatePaymentRecordPayload) => void;
  onSubmitUpdate: (recordId: string, payload: UpdatePaymentRecordPayload) => void;
  isSubmitting: boolean;
}

function toInitialProof(record: PaymentRecordItem | null): PaymentProofPayload | null {
  if (!record?.proofStorageKey || !record.proofFileName || !record.proofMimeType || !record.proofSizeBytes) return null;
  return {
    storageKey: record.proofStorageKey,
    fileName: record.proofFileName,
    mimeType: record.proofMimeType as PaymentProofMime,
    sizeBytes: record.proofSizeBytes,
  };
}

export function PaymentRecordFormModal({
  isOpen, onClose, payeeId, payeeName, recordToEdit, onSubmitCreate, onSubmitUpdate, isSubmitting,
}: PaymentRecordFormModalProps) {
  const isEditing = Boolean(recordToEdit);
  const [proof, setProof] = useState<PaymentProofPayload | null>(() => toInitialProof(recordToEdit));
  const { uploadFile, isUploading, errorMessage, clearError } = usePaymentProofUpload(payeeId);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentRecordFormValues>({
    resolver: zodResolver(paymentRecordFormSchema),
    defaultValues: recordToEdit
      ? {
          status: recordToEdit.status,
          amount: String(recordToEdit.amount),
          recordDate: recordToEdit.recordDate.slice(0, 10),
          dueDate: recordToEdit.dueDate?.slice(0, 10) ?? "",
        }
      : {
          status: "UNPAID",
          amount: "",
          recordDate: new Date().toISOString().slice(0, 10),
          dueDate: "",
        },
  });

  const handleSelectFile = async (file: File) => {
    const uploaded = await uploadFile(file);
    if (uploaded) setProof(uploaded);
  };

  const handleFormSubmit = (data: PaymentRecordFormValues) => {
    const payload: CreatePaymentRecordPayload = {
      status: data.status,
      amount: Number(data.amount),
      recordDate: data.recordDate,
      dueDate: data.dueDate && data.dueDate.trim() !== "" ? data.dueDate : null,
      proof,
    };
    if (isEditing && recordToEdit) {
      onSubmitUpdate(recordToEdit.id, payload);
    } else {
      onSubmitCreate(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Ubah Catatan Pembayaran" : "Tambah Catatan Pembayaran"}
          </DialogTitle>
          <DialogDescription>
            Catatan pembayaran global untuk <strong>{payeeName}</strong> (BR-36).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5 py-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="payment-status">Status *</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val: string | null) =>
                      field.onChange(val === "PAID" ? "PAID" : "UNPAID")
                    }
                  >
                    <SelectTrigger id="payment-status" className="h-10">
                      <SelectValue placeholder="Pilih Status">
                        {field.value === "PAID" ? "Sudah Dibayar" : "Belum Dibayar"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNPAID">Belum Dibayar</SelectItem>
                      <SelectItem value="PAID">Sudah Dibayar</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="payment-amount">Nominal (Rp) *</Label>
              <Input
                id="payment-amount"
                type="number"
                inputMode="numeric"
                min="1"
                step="any"
                placeholder="1500000"
                className="h-10"
                {...register("amount")}
              />
              {errors.amount && <p className="text-status-danger-fg text-xs">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="payment-date">Tanggal Catatan *</Label>
              <Input id="payment-date" type="date" className="h-10" {...register("recordDate")} />
              {errors.recordDate && <p className="text-status-danger-fg text-xs">{errors.recordDate.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="payment-due-date">Jatuh Tempo (Opsional)</Label>
              <Input id="payment-due-date" type="date" className="h-10" {...register("dueDate")} />
              {errors.dueDate && <p className="text-status-danger-fg text-xs">{errors.dueDate.message}</p>}
            </div>
          </div>

          <PaymentProofField
            proof={proof}
            existingViewUrl={
              recordToEdit?.proofStorageKey === proof?.storageKey
                ? recordToEdit?.proofViewUrl
                : null
            }
            isUploading={isUploading}
            errorMessage={errorMessage}
            onSelectFile={handleSelectFile}
            onRemoveProof={() => {
              setProof(null);
              clearError();
            }}
          />

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isUploading}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Simpan Catatan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
