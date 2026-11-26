"use client";

import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatIdDate } from "@/lib/utils/office-format";
import { StoredFileImage } from "@/components/ui/StoredFileImage";
import { fileApi } from "@/lib/api/file.api";
import type { DrawingItem } from "@/types/api/drawing.types";

interface DrawingPreviewModalProps {
  drawing: DrawingItem | null;
  onClose: () => void;
}

export function DrawingPreviewModal({ drawing, onClose }: DrawingPreviewModalProps) {
  if (!drawing) return null;

  return (
    <Dialog open={Boolean(drawing)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">{drawing.fileName}</DialogTitle>
          <DialogDescription className="text-xs tabular-nums">
            Diunggah {formatIdDate(drawing.uploadedAt)} ·{" "}
            {Math.max(1, Math.round(drawing.sizeBytes / 1024))} KB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="overflow-hidden rounded-lg border border-border bg-canvas">
            <StoredFileImage
              contentPath={drawing.contentPath}
              alt={drawing.fileName}
              className="max-h-[65vh] w-full object-contain"
              fallbackClassName="min-h-64 w-full"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void fileApi.openContent(drawing.contentPath)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface-input px-3 text-xs font-medium text-text-primary transition-colors hover:bg-surface-active"
            >
              <ExternalLink className="size-3.5" />
              Buka Gambar di Tab Baru
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
