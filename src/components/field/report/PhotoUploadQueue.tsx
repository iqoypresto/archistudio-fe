"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, CheckCircle2, Loader2, RefreshCw, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { MAX_REPORT_PHOTOS } from "@/lib/validation/upload.validation";
import type { PhotoQueueItem, UploadQueueStatus } from "@/types/api/upload.types";

const STATUS_BADGE_MAP: Record<UploadQueueStatus, { label: string; tone: StatusTone }> = {
  idle: { label: "Menunggu", tone: "muted" },
  compressing: { label: "Mengompres...", tone: "info" },
  signing: { label: "Menyiapkan...", tone: "info" },
  uploading: { label: "Mengunggah", tone: "info" },
  uploaded: { label: "Terunggah", tone: "success" },
  failed: { label: "Gagal Unggah", tone: "danger" },
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

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-3.5">
      <div className="flex items-start gap-3">
        <Image
          src={item.previewUrl}
          alt={`Foto laporan ${index + 1}`}
          width={80}
          height={80}
          unoptimized
          className="size-20 shrink-0 rounded-lg border border-border object-cover"
        />

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

          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-all ${
                item.status === "failed"
                  ? "bg-status-danger-fg"
                  : item.status === "uploaded"
                    ? "bg-status-success-fg"
                    : "bg-primary"
              }`}
              style={{ width: `${item.progress}%` }}
            />
          </div>

          <Input
            type="text"
            value={item.caption}
            disabled={disabled}
            onChange={(e) => onCaptionChange(item.id, e.target.value)}
            placeholder="Keterangan singkat foto (opsional)"
            className="min-h-11 text-base"
          />
        </div>
      </div>

      {item.status === "failed" && (
        <div className="space-y-2 rounded-lg bg-status-danger-bg p-3 text-sm text-status-danger-fg">
          <p>{item.errorMessage ?? "Gagal mengunggah foto ini."}</p>
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
  onAddFiles: (files: FileList) => void;
  onRetry: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canAddMore = items.length < MAX_REPORT_PHOTOS;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-text-primary">
          Foto Lapangan ({items.length}/{MAX_REPORT_PHOTOS})
        </p>
        <span className="text-sm text-text-secondary">Min. 1 foto (JPG/PNG/WebP)</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onAddFiles(e.target.files);
          }
          e.target.value = "";
        }}
      />

      <Button
        type="button"
        variant="outline"
        disabled={disabled || !canAddMore}
        onClick={() => inputRef.current?.click()}
        className="min-h-12 w-full border-dashed border-primary/50 bg-primary-soft/50 text-base font-semibold text-primary hover:bg-primary-soft"
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
