"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StoredFileImage } from "@/components/ui/StoredFileImage";
import { fileApi } from "@/lib/api/file.api";
import { formatIdDate } from "@/lib/utils/office-format";
import type { DrawingItem } from "@/types/api/drawing.types";

interface DrawingPreviewModalProps {
  drawings: DrawingItem[];
  activeIndex: number | null;
  onChangeIndex: (nextIndex: number | null) => void;
}

export function DrawingPreviewModal({
  drawings,
  activeIndex,
  onChangeIndex,
}: DrawingPreviewModalProps) {
  const drawing = activeIndex === null ? null : (drawings[activeIndex] ?? null);

  useEffect(() => {
    if (activeIndex === null || drawings.length < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      onChangeIndex((activeIndex + step + drawings.length) % drawings.length);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, drawings.length, onChangeIndex]);

  const move = (step: -1 | 1) => {
    if (activeIndex === null || drawings.length < 2) return;
    onChangeIndex((activeIndex + step + drawings.length) % drawings.length);
  };

  return (
    <Dialog open={Boolean(drawing)} onOpenChange={(open) => !open && onChangeIndex(null)}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/95 supports-backdrop-filter:backdrop-blur-[2px]"
        className="fixed inset-0 top-0 left-0 z-50 flex h-dvh max-h-dvh w-dvw max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none bg-black p-0 text-white ring-0 sm:max-w-none"
      >
        {drawing && activeIndex !== null && (
          <div className="flex h-full min-h-0 w-full flex-col px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-6">
            <div className="flex min-h-12 items-center justify-between gap-3">
              <DialogHeader className="min-w-0 flex-1 gap-0.5 pr-0">
                <DialogTitle className="truncate text-sm font-semibold text-white">
                  {drawing.fileName}
                </DialogTitle>
                <DialogDescription className="text-xs text-white/70 tabular-nums">
                  Diunggah {formatIdDate(drawing.uploadedAt)} ·{" "}
                  {Math.max(1, Math.round(drawing.sizeBytes / 1024))} KB
                </DialogDescription>
              </DialogHeader>
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    aria-label="Tutup pratinjau drawing"
                    className="size-12 min-h-12 shrink-0 rounded-full bg-white/15 text-white hover:bg-white/25 hover:text-white focus-visible:ring-white"
                  />
                }
              >
                <X className="size-6" aria-hidden="true" />
              </DialogClose>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center py-3">
              <StoredFileImage
                contentPath={drawing.contentPath}
                alt={drawing.fileName}
                variant="full"
                eager
                className="max-h-full max-w-full object-contain"
                fallbackClassName="grid size-full place-items-center text-white/70"
              />
              {drawings.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    aria-label="Drawing sebelumnya"
                    onClick={() => move(-1)}
                    className="absolute top-1/2 left-1 size-12 min-h-12 -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white focus-visible:ring-white sm:left-3"
                  >
                    <ChevronLeft className="size-7" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    aria-label="Drawing berikutnya"
                    onClick={() => move(1)}
                    className="absolute top-1/2 right-1 size-12 min-h-12 -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white focus-visible:ring-white sm:right-3"
                  >
                    <ChevronRight className="size-7" aria-hidden="true" />
                  </Button>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-xs font-medium text-white/80 tabular-nums" aria-live="polite">
                {activeIndex + 1} / {drawings.length}
              </span>
              <button
                type="button"
                onClick={() => void fileApi.openContent(drawing.contentPath)}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3.5 text-xs font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ExternalLink className="size-3.5" />
                Buka Gambar di Tab Baru
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
