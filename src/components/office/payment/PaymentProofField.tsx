"use client";

import type { ChangeEvent } from "react";
import { Eye, ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { openProjectFile } from "@/lib/utils/project-file";
import type { PaymentProofPayload } from "@/types/api/payment.types";
import type { ProjectFilePreviewItem } from "@/types/project-file.types";

interface PaymentProofFieldProps {
  proof: PaymentProofPayload | null;
  existingContentPath?: string | null;
  isUploading: boolean;
  errorMessage: string | null;
  onSelectFile: (file: File) => void;
  onRemoveProof: () => void;
  onPreviewFile: (item: ProjectFilePreviewItem) => void;
}

export function PaymentProofField({
  proof,
  existingContentPath,
  isUploading,
  errorMessage,
  onSelectFile,
  onRemoveProof,
  onPreviewFile,
}: PaymentProofFieldProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onSelectFile(file);
  };

  const handleOpenExisting = () => {
    if (!proof || !existingContentPath) return;
    openProjectFile(
      {
        id: proof.storedFileId,
        fileName: proof.fileName,
        mimeType: proof.mimeType,
        sizeBytes: proof.sizeBytes,
        uploadedAt: null,
        contentPath: existingContentPath,
      },
      onPreviewFile,
    );
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor="payment-proof-input">Bukti Pembayaran (Opsional — JPG/PNG, maks. 2 MB)</Label>

      {proof ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-input p-2.5 text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <ImageIcon className="h-4 w-4 shrink-0 text-text-secondary" />
            <div className="min-w-0">
              <p className="truncate font-medium text-text-primary">{proof.fileName}</p>
              <p className="text-text-secondary">
                {Math.max(1, Math.round(proof.sizeBytes / 1024))} KB
              </p>
              {existingContentPath && (
                <button
                  type="button"
                  onClick={handleOpenExisting}
                  className="mt-1.5 inline-flex min-h-10 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 text-xs font-medium text-text-primary transition-colors hover:bg-surface-active md:mt-1 md:min-h-7 md:px-2"
                >
                  <Eye className="size-3.5" aria-hidden="true" />
                  Lihat bukti
                </button>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Hapus bukti pembayaran"
            className="size-11 shrink-0 text-status-danger-fg md:size-8"
            onClick={onRemoveProof}
            title="Hapus bukti"
            disabled={isUploading}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <Label
          htmlFor="payment-proof-input"
          className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-input/70 px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-white/25 hover:text-text-primary focus-within:ring-2 focus-within:ring-ring"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengunggah bukti ke storage...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Pilih Gambar Bukti (JPG / PNG, maks. 2 MB)
            </>
          )}
          <Input
            id="payment-proof-input"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
          />
        </Label>
      )}

      {errorMessage && <p className="text-status-danger-fg text-xs">{errorMessage}</p>}
    </div>
  );
}
