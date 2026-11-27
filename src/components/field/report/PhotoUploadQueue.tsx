"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MAX_REPORT_PHOTOS } from "@/lib/validation/upload.validation";
import type { PhotoQueueItem } from "@/types/api/upload.types";

export function PhotoUploadQueue({ items, disabled, onAddFiles, onReplaceFile, onRetry, onCaptionChange, onRemove }: {
  items: PhotoQueueItem[];
  disabled?: boolean;
  onAddFiles: (files: FileList) => void | Promise<unknown>;
  onReplaceFile: (id: string, file: File) => void | Promise<unknown>;
  onRetry: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const replacementId = useRef<string | null>(null);
  const canAddMore = items.length < MAX_REPORT_PHOTOS;
  function openAddPicker(): void {
    replacementId.current = null;
    if (inputRef.current) inputRef.current.multiple = true;
    inputRef.current?.click();
  }
  function openReplacementPicker(id: string): void {
    replacementId.current = id;
    if (inputRef.current) inputRef.current.multiple = false;
    inputRef.current?.click();
  }
  function handleFileSelection(files: FileList | null): void {
    const targetId = replacementId.current;
    replacementId.current = null;
    if (inputRef.current) inputRef.current.multiple = true;
    if (!files?.length) return;
    if (targetId) void onReplaceFile(targetId, files[0]);
    else void onAddFiles(files);
  }
  return <div className="space-y-4">
    <div className="rounded-2xl border border-dashed border-primary/70 bg-surface-input px-4 py-5 text-center">
      <Camera aria-hidden="true" className="mx-auto size-10 text-primary" />
      <Button type="button" disabled={disabled || !canAddMore} onClick={openAddPicker} className="mt-3 min-h-11 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground">
        {canAddMore ? "Ambil atau Pilih Foto" : "Maksimal 10 Foto Tercapai"}
      </Button>
      <p className="mt-2 text-sm text-text-secondary">Minimal 1, maksimal 10 foto</p>
      <Input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => {
        handleFileSelection(event.target.files);
        event.target.value = "";
      }} />
    </div>
    <p className="text-sm font-medium text-text-primary">{items.length} dari {MAX_REPORT_PHOTOS} foto</p>
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, index) => <article key={item.id} className="min-w-0 space-y-2 rounded-2xl border border-border bg-surface p-2 shadow-xs">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
          {item.previewUrl && <Image src={item.previewUrl} alt={`Foto laporan ${index + 1}`} fill unoptimized sizes="(max-width: 640px) 45vw, 240px" className="object-cover" />}
          {!item.previewUrl && <div className="grid h-full place-items-center p-2 text-center text-sm text-text-secondary">{item.storedFileId ? "Foto tersimpan" : "Foto perlu dipilih ulang"}</div>}
          <button type="button" aria-label={`Hapus foto ${index + 1}`} disabled={disabled || item.status === "uploading"} onClick={() => onRemove(item.id)} style={{ width: 32, height: 32, minWidth: 32, minHeight: 32, maxWidth: 32, maxHeight: 32, borderRadius: "50%" }} className="absolute right-2 top-2 grid place-items-center bg-white text-primary shadow">
            <Trash2 aria-hidden="true" className="size-4" />
          </button>
          {item.status === "uploading" && item.progress > 0 && <div role="progressbar" aria-label={`Progres unggah foto ${index + 1}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress} className="absolute inset-x-2 bottom-2 h-2 overflow-hidden rounded-full bg-white/70"><div className="h-full bg-primary transition-[width]" style={{ width: `${item.progress}%` }} /></div>}
        </div>
        <Input aria-label={`Keterangan foto ${index + 1}`} value={item.caption} disabled={disabled} onChange={(event) => onCaptionChange(item.id, event.target.value)} placeholder="Keterangan foto" className="h-10 rounded-xl px-2 text-sm" />
        <div role="status" className="flex min-h-8 items-center justify-between gap-1 text-xs">
          <StatusBadge tone={item.status === "failed" ? "danger" : item.status === "uploaded" ? "success" : item.status === "local" ? "muted" : "info"}>
            {item.status === "compressing" || item.status === "signing" ? <><Loader2 className="mr-1 inline size-3 animate-spin" />Menyiapkan…</> : item.status === "failed" ? "Gagal" : item.status === "uploading" ? (item.progress > 0 ? `Mengunggah ${item.progress}%` : "Mengunggah…") : item.status === "uploaded" ? "Terunggah" : "Siap dikirim"}
          </StatusBadge>
          {item.status === "failed" && item.file && <button type="button" disabled={disabled} className="font-semibold text-status-danger-fg underline disabled:opacity-50" onClick={() => onRetry(item.id)}>Coba lagi</button>}
          {item.status === "failed" && !item.file && <button type="button" disabled={disabled} className="font-semibold text-primary underline disabled:opacity-50" onClick={() => openReplacementPicker(item.id)}>Pilih ulang</button>}
        </div>
      </article>)}
      {items.length > 0 && canAddMore && <button type="button" disabled={disabled} onClick={openAddPicker} aria-label="Tambah foto" className="grid aspect-square place-items-center rounded-2xl border border-dashed border-primary/70 text-primary"><Camera aria-hidden="true" className="size-9" /></button>}
    </div>
  </div>;
}
