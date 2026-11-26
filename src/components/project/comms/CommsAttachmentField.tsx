"use client";

import type { ChangeEvent } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COMMS_ATTACHMENT_ACCEPT } from "@/lib/validation/comms.validation";
import type { CommsAttachmentPayload } from "@/types/api/comms.types";
import { fileApi } from "@/lib/api/file.api";

interface CommsAttachmentFieldProps {
  attachment: CommsAttachmentPayload | null;
  existingContentPath?: string | null;
  isUploading: boolean;
  errorMessage: string | null;
  onSelectFile: (file: File) => void;
  onRemoveAttachment: () => void;
}

export function CommsAttachmentField({
  attachment,
  existingContentPath,
  isUploading,
  errorMessage,
  onSelectFile,
  onRemoveAttachment,
}: CommsAttachmentFieldProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onSelectFile(file);
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor="comms-attachment-input">
        Lampiran (Opsional — 1 file PDF/Word/Excel, maks. 5 MB)
      </Label>

      {attachment ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-input p-2.5 text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-text-secondary" />
            <div className="min-w-0">
              <p className="truncate font-medium text-text-primary">{attachment.fileName}</p>
              <p className="text-text-secondary">
                {Math.max(1, Math.round(attachment.sizeBytes / 1024))} KB
                {existingContentPath && (
                  <>
                    {" · "}
                    <button
                      type="button"
                      onClick={() => void fileApi.openContent(existingContentPath)}
                      className="text-text-primary underline"
                    >
                      Buka lampiran
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-status-danger-fg"
            onClick={onRemoveAttachment}
            title="Hapus lampiran"
            disabled={isUploading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Label
          htmlFor="comms-attachment-input"
          className="flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-input/70 px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-white/25 hover:text-text-primary"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengunggah lampiran...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Pilih Lampiran (PDF / Word / Excel, maks. 5 MB)
            </>
          )}
          <Input
            id="comms-attachment-input"
            type="file"
            accept={COMMS_ATTACHMENT_ACCEPT}
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
