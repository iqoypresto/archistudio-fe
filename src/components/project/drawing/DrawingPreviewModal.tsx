"use client";

import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
          <DialogDescription>
            Drawing {drawing.direction === "IN" ? "In" : "Out"} • Diunggah{" "}
            {drawing.uploadedAt.slice(0, 10)} •{" "}
            {Math.max(1, Math.round(drawing.sizeBytes / 1024))} KB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="overflow-hidden rounded-lg border border-border bg-surface-subtle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={drawing.viewUrl}
              alt={drawing.fileName}
              className="max-h-[65vh] w-full object-contain"
            />
          </div>

          <div className="flex justify-end">
            <a
              href={drawing.viewUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Buka Gambar di Tab Baru
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
