"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCommsAttachmentUpload } from "@/hooks/comms.hooks";
import { commsFormSchema, type CommsFormValues } from "@/lib/validation/comms.validation";
import type {
  CommsAttachmentPayload,
  CommsEntryItem,
  CreateCommsPayload,
  UpdateCommsPayload,
} from "@/types/api/comms.types";
import { CommsAttachmentField } from "./CommsAttachmentField";

interface CommsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  entryToEdit: CommsEntryItem | null;
  onSubmitCreate: (payload: CreateCommsPayload) => void;
  onSubmitUpdate: (commsId: string, payload: UpdateCommsPayload) => void;
  isSubmitting: boolean;
}

function toInitialAttachment(entry: CommsEntryItem | null): CommsAttachmentPayload | null {
  if (!entry?.attachmentKey || !entry.attachmentName || !entry.attachmentMime || !entry.attachmentBytes) {
    return null;
  }
  return {
    storageKey: entry.attachmentKey,
    fileName: entry.attachmentName,
    mimeType: entry.attachmentMime,
    sizeBytes: entry.attachmentBytes,
  };
}

export function CommsFormModal({
  isOpen,
  onClose,
  projectId,
  entryToEdit,
  onSubmitCreate,
  onSubmitUpdate,
  isSubmitting,
}: CommsFormModalProps) {
  const isEditing = Boolean(entryToEdit);
  const [attachment, setAttachment] = useState<CommsAttachmentPayload | null>(() =>
    toInitialAttachment(entryToEdit),
  );
  const { uploadFile, isUploading, errorMessage, clearError } = useCommsAttachmentUpload(projectId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CommsFormValues>({
    resolver: zodResolver(commsFormSchema),
    defaultValues: entryToEdit
      ? {
          entryDate: entryToEdit.entryDate.slice(0, 10),
          direction: entryToEdit.direction,
          subject: entryToEdit.subject,
          note: entryToEdit.note ?? "",
        }
      : {
          entryDate: new Date().toISOString().slice(0, 10),
          direction: "INBOUND",
          subject: "",
          note: "",
        },
  });

  const handleSelectFile = async (file: File) => {
    const uploaded = await uploadFile(file);
    if (uploaded) setAttachment(uploaded);
  };

  const handleFormSubmit = (data: CommsFormValues) => {
    const payload: CreateCommsPayload = {
      entryDate: data.entryDate,
      direction: data.direction,
      subject: data.subject,
      note: data.note && data.note.trim() !== "" ? data.note.trim() : null,
      attachment,
    };
    if (isEditing && entryToEdit) {
      onSubmitUpdate(entryToEdit.id, payload);
    } else {
      onSubmitCreate(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Ubah Catatan Comms" : "Tambah Catatan Comms"}</DialogTitle>
          <DialogDescription>
            Catat komunikasi masuk atau keluar project beserta lampiran opsional (BR-35).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3.5 py-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="comms-date">Tanggal *</Label>
              <Input id="comms-date" type="date" className="h-11" {...register("entryDate")} />
              {errors.entryDate && (
                <p className="text-status-danger-fg text-xs">{errors.entryDate.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="comms-direction">Arah Komunikasi *</Label>
              <select
                id="comms-direction"
                {...register("direction")}
                className="border-border bg-surface text-text-primary focus:ring-primary h-11 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
              >
                <option value="INBOUND">Masuk</option>
                <option value="OUTBOUND">Keluar</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="comms-subject">Subjek *</Label>
            <Input
              id="comms-subject"
              placeholder="Contoh: Persetujuan revisi denah lantai 2"
              className="h-11"
              {...register("subject")}
            />
            {errors.subject && (
              <p className="text-status-danger-fg text-xs">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="comms-note">Catatan Singkat (Opsional)</Label>
            <textarea
              id="comms-note"
              rows={3}
              placeholder="Ringkasan poin komunikasi..."
              {...register("note")}
              className="border-border bg-surface text-text-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            />
            {errors.note && (
              <p className="text-status-danger-fg text-xs">{errors.note.message}</p>
            )}
          </div>

          <CommsAttachmentField
            attachment={attachment}
            existingViewUrl={
              entryToEdit?.attachmentKey === attachment?.storageKey
                ? entryToEdit?.attachmentViewUrl
                : null
            }
            isUploading={isUploading}
            errorMessage={errorMessage}
            onSelectFile={handleSelectFile}
            onRemoveAttachment={() => {
              setAttachment(null);
              clearError();
            }}
          />

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
            >
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
