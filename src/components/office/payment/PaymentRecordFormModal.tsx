"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ProjectFilePreviewDialog } from "@/components/field/project/ProjectFilePreviewDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalContextStrip } from "@/components/ui/ModalContextStrip";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { usePaymentProofUpload } from "@/hooks/payment.hooks";
import { formatCurrencyIdr, paymentRecordFormSchema, type PaymentRecordFormValues } from "@/lib/validation/payment.validation";
import type {
  CreatePaymentRecordPayload, PaymentProofMime, PaymentProofPayload,
  PaymentRecordItem, PaymentStatus, UpdatePaymentRecordPayload,
} from "@/types/api/payment.types";
import type { ProjectFilePreviewItem } from "@/types/project-file.types";
import { PaymentProofField } from "./PaymentProofField";

const STATUS_OPTIONS: readonly { value: PaymentStatus; label: string }[] = [
  { value: "UNPAID", label: "Belum Dibayar" },
  { value: "PAID", label: "Sudah Dibayar" },
];

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
  if (!record?.proofStoredFileId || !record.proofFileName || !record.proofMimeType || !record.proofSizeBytes) return null;
  return {
    storedFileId: record.proofStoredFileId, fileName: record.proofFileName,
    mimeType: record.proofMimeType as PaymentProofMime, sizeBytes: record.proofSizeBytes,
  };
}

export function PaymentRecordFormModal({
  isOpen, onClose, payeeId, payeeName, recordToEdit, onSubmitCreate, onSubmitUpdate, isSubmitting,
}: PaymentRecordFormModalProps) {
  const isEditing = Boolean(recordToEdit);
  const [proof, setProof] = useState<PaymentProofPayload | null>(() => toInitialProof(recordToEdit));
  const [previewFile, setPreviewFile] = useState<ProjectFilePreviewItem | null>(null);
  const { uploadFile, isUploading, errorMessage, clearError } = usePaymentProofUpload(payeeId);

  const { register, control, handleSubmit, formState: { errors } } = useForm<PaymentRecordFormValues>({
    resolver: zodResolver(paymentRecordFormSchema),
    defaultValues: recordToEdit
      ? {
          status: recordToEdit.status, amount: String(recordToEdit.amount),
          recordDate: recordToEdit.recordDate.slice(0, 10), dueDate: recordToEdit.dueDate?.slice(0, 10) ?? "",
        }
      : { status: "UNPAID", amount: "", recordDate: new Date().toISOString().slice(0, 10), dueDate: "" },
  });

  const amountRaw = useWatch({ control, name: "amount" });
  const parsedAmount = Number(amountRaw);
  const hasPreviewAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const handleSelectFile = async (file: File) => {
    const uploaded = await uploadFile(file);
    if (uploaded) setProof(uploaded);
  };

  const handleFormSubmit = (data: PaymentRecordFormValues) => {
    const payload: CreatePaymentRecordPayload = {
      status: data.status, amount: Number(data.amount), recordDate: data.recordDate,
      dueDate: data.dueDate?.trim() ? data.dueDate : null, proof,
    };
    if (isEditing && recordToEdit) onSubmitUpdate(recordToEdit.id, payload);
    else onSubmitCreate(payload);
  };

  return (
    <>
      <Dialog open={isOpen && !previewFile} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Ubah Catatan Pembayaran" : "Tambah Catatan Pembayaran"}</DialogTitle>
          <DialogDescription className="text-xs">
            Catat nominal, tanggal, status, dan bukti transfer bila tersedia.
          </DialogDescription>
        </DialogHeader>

        <ModalContextStrip kicker="Penerima Pembayaran" title={payeeName} />

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Status Pembayaran</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <SegmentedControl ariaLabel="Status pembayaran" fullWidth options={STATUS_OPTIONS} value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-amount" className="text-xs font-medium">Nominal (Rp)</Label>
            <Input id="payment-amount" type="number" inputMode="numeric" min="1" step="any" placeholder="3500000" className="h-9 text-xs tabular-nums" {...register("amount")} />
            {hasPreviewAmount && (
              <p className="text-[11px] text-text-secondary tabular-nums">
                Terbaca: <strong className="text-text-primary">{formatCurrencyIdr(parsedAmount)}</strong>
              </p>
            )}
            {errors.amount && <p className="text-xs text-status-danger-fg">{errors.amount.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="payment-date" className="text-xs font-medium">Tanggal Catatan</Label>
              <Input id="payment-date" type="date" className="h-9 text-xs tabular-nums" {...register("recordDate")} />
              {errors.recordDate && <p className="text-xs text-status-danger-fg">{errors.recordDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="payment-due-date" className="text-xs font-medium">Jatuh Tempo</Label>
                <span className="text-[11px] text-text-muted">Opsional</span>
              </div>
              <Input id="payment-due-date" type="date" className="h-9 text-xs tabular-nums" {...register("dueDate")} />
              {errors.dueDate && <p className="text-xs text-status-danger-fg">{errors.dueDate.message}</p>}
            </div>
          </div>

          <PaymentProofField
            proof={proof}
            existingContentPath={recordToEdit?.proofStoredFileId === proof?.storedFileId ? recordToEdit?.proofContentPath : null}
            isUploading={isUploading}
            errorMessage={errorMessage}
            onSelectFile={handleSelectFile}
            onRemoveProof={() => { setProof(null); clearError(); }}
            onPreviewFile={setPreviewFile}
          />

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isUploading} className="h-9">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading} className="h-9">
              {isSubmitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Simpan Catatan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

      <ProjectFilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
    </>
  );
}
