"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Textarea } from "@/components/ui/textarea";
import { useCommsAttachmentUpload } from "@/hooks/comms.hooks";
import { commsFormSchema, type CommsFormValues } from "@/lib/validation/comms.validation";
import type {
  CommsAttachmentPayload, CommsDirection, CommsEntryItem, CreateCommsPayload, UpdateCommsPayload,
} from "@/types/api/comms.types";
import type { ApiSurface } from "@/lib/api/api-surface";
import { CommsAttachmentField } from "./CommsAttachmentField";

const DIRECTION_OPTIONS: readonly { value: CommsDirection; label: string }[] = [
  { value: "INBOUND", label: "Masuk" },
  { value: "OUTBOUND", label: "Keluar" },
];

interface CommsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  surface: ApiSurface;
  fixedDirection?: CommsDirection;
  entryToEdit: CommsEntryItem | null;
  onSubmitCreate: (payload: CreateCommsPayload) => void;
  onSubmitUpdate: (commsId: string, payload: UpdateCommsPayload) => void;
  isSubmitting: boolean;
}

function toInitialAttachment(entry: CommsEntryItem | null): CommsAttachmentPayload | null {
  if (!entry?.attachmentStoredFileId || !entry.attachmentName || !entry.attachmentMime || !entry.attachmentBytes) return null;
  return {
    storedFileId: entry.attachmentStoredFileId, fileName: entry.attachmentName,
    mimeType: entry.attachmentMime, sizeBytes: entry.attachmentBytes,
  };
}

export function CommsFormModal({
  isOpen, onClose, projectId, surface, fixedDirection, entryToEdit, onSubmitCreate, onSubmitUpdate, isSubmitting,
}: CommsFormModalProps) {
  const isEditing = Boolean(entryToEdit);
  const [attachment, setAttachment] = useState<CommsAttachmentPayload | null>(() => toInitialAttachment(entryToEdit));
  const { uploadFile, isUploading, errorMessage, clearError } = useCommsAttachmentUpload(projectId, surface);

  const { register, control, handleSubmit, formState: { errors } } = useForm<CommsFormValues>({
    resolver: zodResolver(commsFormSchema),
    defaultValues: entryToEdit
      ? {
          entryDate: entryToEdit.entryDate.slice(0, 10), direction: fixedDirection ?? entryToEdit.direction,
          subject: entryToEdit.subject, note: entryToEdit.note ?? "",
        }
      : { entryDate: new Date().toISOString().slice(0, 10), direction: fixedDirection ?? "INBOUND", subject: "", note: "" },
  });

  const handleSelectFile = async (file: File) => {
    const uploaded = await uploadFile(file);
    if (uploaded) setAttachment(uploaded);
  };

  const handleFormSubmit = (data: CommsFormValues) => {
    const payload: CreateCommsPayload = {
      entryDate: data.entryDate, direction: fixedDirection ?? data.direction, subject: data.subject,
      note: data.note?.trim() ? data.note.trim() : null, attachment,
    };
    if (isEditing && entryToEdit) onSubmitUpdate(entryToEdit.id, payload);
    else onSubmitCreate(payload);
  };

  const pageTitle = fixedDirection === "INBOUND" ? "Comms In" : fixedDirection === "OUTBOUND" ? "Comms Out" : "Comms";
  const dirDesc = fixedDirection === "INBOUND" ? "masuk" : fixedDirection === "OUTBOUND" ? "keluar" : "masuk atau keluar";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Ubah Catatan ${pageTitle}` : `Tambah Catatan ${pageTitle}`}</DialogTitle>
          <DialogDescription className="text-xs">
            Catat komunikasi {dirDesc} proyek beserta lampiran opsional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5">
          <div className={fixedDirection ? "space-y-1.5" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
            <div className="space-y-1.5">
              <Label htmlFor="comms-date" className="text-xs font-medium">Tanggal</Label>
              <Input id="comms-date" type="date" className="h-9 text-xs tabular-nums" {...register("entryDate")} />
              {errors.entryDate && <p className="text-xs text-status-danger-fg">{errors.entryDate.message}</p>}
            </div>
            {!fixedDirection && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Arah Komunikasi</Label>
                <Controller
                  name="direction"
                  control={control}
                  render={({ field }) => (
                    <SegmentedControl ariaLabel="Arah komunikasi" fullWidth options={DIRECTION_OPTIONS} value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comms-subject" className="text-xs font-medium">Subjek</Label>
            <Input id="comms-subject" placeholder="Contoh: Persetujuan revisi denah lantai 2" className="h-9 text-xs" {...register("subject")} />
            {errors.subject && <p className="text-xs text-status-danger-fg">{errors.subject.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="comms-note" className="text-xs font-medium">Catatan Singkat</Label>
              <span className="text-[11px] text-text-muted">Opsional</span>
            </div>
            <Textarea
              id="comms-note"
              rows={3}
              placeholder="Ringkasan poin komunikasi..."
              {...register("note")}
              className="min-h-20 w-full rounded-lg border-border bg-surface-input px-3 py-2 text-xs text-text-primary"
            />
            {errors.note && <p className="text-xs text-status-danger-fg">{errors.note.message}</p>}
          </div>

          <CommsAttachmentField
            attachment={attachment}
            existingContentPath={entryToEdit?.attachmentStoredFileId === attachment?.storedFileId ? entryToEdit?.attachmentContentPath : null}
            isUploading={isUploading}
            errorMessage={errorMessage}
            onSelectFile={handleSelectFile}
            onRemoveAttachment={() => { setAttachment(null); clearError(); }}
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
  );
}
