"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, CheckCircle2, Image as ImageIcon, Loader2, RefreshCw, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { MAX_REPORT_PHOTOS } from "@/lib/validation/upload.validation";
import type { PhotoQueueItem, UploadQueueStatus } from "@/types/api/upload.types";

const STATUS_BADGE_MAP: Record<UploadQueueStatus, { label: string; tone: StatusTone }> = {
  idle: { label: "Menunggu", tone: "muted" },
  local: { label: "Siap diunggah", tone: "info" },
  compressing: { label: "Mengompres...", tone: "info" },
  signing: { label: "Menyiapkan...", tone: "info" },
  uploading: { label: "Mengunggah", tone: "info" },
  uploaded: { label: "Terunggah", tone: "success" },
  failed: { label: "Gagal", tone: "danger" },
};

function PhotoQueueItemCard({
  item,
  index,
  disabled,
  onRetry,
  onCaptionChange,
  onRemove,
}: {
  item: PhotoQueueItem;
  index: number;
  disabled?: boolean;
  onRetry: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
  onRemove: (id: string) => void;
}) {
  const badge = STATUS_BADGE_MAP[item.status];
  const inProgress =
    item.status === "compressing" || item.status === "signing" || item.status === "uploading";
  const captionId = `report-photo-caption-${item.id}`;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-3.5">
      <div className="flex items-start gap-3">
        {item.previewUrl ? (
          <Image
            src={item.previewUrl}
            alt={`Foto laporan ${index + 1}`}
            width={80}
            height={80}
            unoptimized
            className="size-20 shrink-0 rounded-lg border border-border object-cover"
          />
        ) : (
          <div role="img" aria-label={`Pratinjau foto ${index + 1} tidak tersedia; nama file ${item.fileName}`} className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-text-secondary">
            <ImageIcon aria-hidden="true" className="size-6" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-text-primary">
              Foto #{index + 1}
            </span>
            <StatusBadge tone={badge.tone}>
              {inProgress && <Loader2 className="size-3.5 animate-spin" />}
              {item.status === "uploaded" && <CheckCircle2 className="size-3.5" />}
              {item.status === "failed" && <XCircle className="size-3.5" />}
              <span>
                {item.status === "uploading" ? `${badge.label} ${item.progress}%` : badge.label}
              </span>
            </StatusBadge>
          </div>

          <div
            role="progressbar"
            aria-label={`Progres unggah foto ${index + 1}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={item.progress}
            aria-valuetext={item.status === "failed" ? "Unggahan gagal" : `${badge.label} ${item.progress}%`}
            className="h-2 w-full overflow-hidden rounded-full bg-secondary"
          >
            <div
              className={`h-full w-full origin-left transition-transform duration-150 ${
                item.status === "failed"
                  ? "bg-status-danger-fg"
                  : item.status === "uploaded"
                    ? "bg-status-success-fg"
                    : "bg-primary"
              }`}
              style={{ transform: `scaleX(${item.progress / 100})` }}
            />
          </div>

          <Label htmlFor={captionId} className="sr-only">Keterangan foto {index + 1}</Label>
          <Input
            id={captionId}
            type="text"
            value={item.caption}
            disabled={disabled}
            onChange={(e) => onCaptionChange(item.id, e.target.value)}
            placeholder="Keterangan singkat foto (opsional)"
            className="min-h-12 text-base"
          />
        </div>
      </div>

      {item.status === "failed" && (
        <div className="space-y-2 rounded-lg bg-status-danger-bg p-3 text-sm text-status-danger-fg">
          <p>{item.errorMessage ?? "Gagal mengunggah foto ini."}</p>
          {item.file && (
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => onRetry(item.id)}
              className="min-h-12 w-full border-status-danger-fg/30 bg-surface text-base font-semibold text-status-danger-fg"
            >
              <RefreshCw className="mr-2 size-4" />
              Ulangi Foto Ini
            </Button>
          )}
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        disabled={disabled || inProgress}
        onClick={() => onRemove(item.id)}
        className="min-h-12 w-full text-base text-status-danger-fg hover:bg-status-danger-bg"
      >
        <Trash2 className="mr-2 size-4" />
        Hapus Foto #{index + 1}
      </Button>
    </div>
  );
}

export function PhotoUploadQueue({
  items,
  disabled,
  onAddFiles,
  onRetry,
  onCaptionChange,
  onRemove,
}: {
  items: PhotoQueueItem[];
  disabled?: boolean;
  onAddFiles: (files: FileList) => void | Promise<void>;
  onRetry: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canAddMore = items.length < MAX_REPORT_PHOTOS;
  const uploadingCount = items.filter((item) => item.status === "uploading").length;
  const uploadedCount = items.filter((item) => item.status === "uploaded").length;
  const failedCount = items.filter((item) => item.status === "failed").length;
  const queueAnnouncement = uploadingCount
    ? `${uploadingCount} foto sedang diunggah; ${uploadedCount} foto selesai.`
    : failedCount
      ? `${failedCount} foto perlu diperbaiki atau dipilih ulang.`
      : items.length > 0 && uploadedCount === items.length
        ? `${uploadedCount} foto siap dilampirkan.`
        : "";

  return (
    <div className="space-y-3">
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{queueAnnouncement}</p>
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-text-primary">
          Foto Lapangan ({items.length}/{MAX_REPORT_PHOTOS})
        </p>
        <span className="text-sm text-text-secondary">Min. 1 foto · unggah di langkah ini</span>
      </div>

      <Input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            void onAddFiles(e.target.files);
          }
          e.target.value = "";
        }}
      />

      <Button
        type="button"
        variant="outline"
        disabled={disabled || !canAddMore}
        onClick={() => inputRef.current?.click()}
        className="min-h-12 w-full border-dashed border-white/20 bg-surface-input text-base font-semibold text-text-primary hover:bg-surface-active"
      >
        <Camera className="mr-2 size-5" />
        {canAddMore ? "Pilih atau Ambil Foto" : "Maksimal 10 Foto Tercapai"}
      </Button>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <PhotoQueueItemCard
            key={item.id}
            item={item}
            index={idx}
            disabled={disabled}
            onRetry={onRetry}
            onCaptionChange={onCaptionChange}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
