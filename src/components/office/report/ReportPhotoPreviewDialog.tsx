"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StoredFileImage } from "@/components/ui/StoredFileImage";
import type { DailyReportPhotoDto } from "@/types/api/report.types";

export function ReportPhotoPreviewDialog({
  photos,
  activeIndex,
  setActiveIndex,
}: {
  photos: DailyReportPhotoDto[];
  activeIndex: number | null;
  setActiveIndex: Dispatch<SetStateAction<number | null>>;
}) {
  const activePhoto = activeIndex === null ? null : photos[activeIndex] ?? null;

  useEffect(() => {
    if (activeIndex === null || photos.length < 2) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      setActiveIndex((current) => {
        if (current === null) return null;
        const direction = event.key === "ArrowRight" ? 1 : -1;
        return (current + direction + photos.length) % photos.length;
      });
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, photos.length, setActiveIndex]);

  function movePhoto(direction: -1 | 1) {
    setActiveIndex((current) => {
      if (current === null || photos.length < 2) return current;
      return (current + direction + photos.length) % photos.length;
    });
  }

  return (
    <DialogContent
      showCloseButton={false}
      overlayClassName="bg-black/95 supports-backdrop-filter:backdrop-blur-[2px]"
      className="fixed inset-0 left-0 top-0 z-50 flex h-dvh w-dvw max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none bg-black p-0 text-white ring-0 sm:max-w-none"
    >
      {activePhoto && activeIndex !== null && (
        <div className="flex h-full min-h-0 w-full flex-col px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-6">
          <div className="flex min-h-12 items-center justify-between gap-3">
            <DialogHeader className="min-w-0 flex-1 gap-1">
              <DialogTitle className="break-words text-sm font-semibold leading-5 text-white">
                {activePhoto.caption?.trim() || `Foto ${activeIndex + 1}`}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Gunakan tombol panah kiri dan kanan untuk berpindah foto. Tekan Escape untuk menutup.
              </DialogDescription>
            </DialogHeader>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  aria-label="Tutup pratinjau foto"
                  className="!size-12 min-h-12 shrink-0 rounded-full bg-white/15 text-white hover:bg-white/25 hover:text-white focus-visible:ring-white"
                />
              }
            >
              <X className="size-6" aria-hidden="true" />
            </DialogClose>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center py-3">
            <StoredFileImage
              contentPath={activePhoto.contentPath}
              alt={activePhoto.caption?.trim() || `Foto laporan ${activeIndex + 1}`}
              variant="full"
              eager
              className="max-h-full max-w-full object-contain"
              fallbackClassName="grid size-full place-items-center text-white/70"
            />
            {photos.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  aria-label="Foto sebelumnya"
                  onClick={() => movePhoto(-1)}
                  className="absolute left-1 top-1/2 !size-12 min-h-12 -translate-y-1/2 rounded-full bg-black/55 text-white hover:bg-black/75 hover:text-white focus-visible:ring-white sm:left-3"
                >
                  <ChevronLeft className="size-7" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  aria-label="Foto berikutnya"
                  onClick={() => movePhoto(1)}
                  className="absolute right-1 top-1/2 !size-12 min-h-12 -translate-y-1/2 rounded-full bg-black/55 text-white hover:bg-black/75 hover:text-white focus-visible:ring-white sm:right-3"
                >
                  <ChevronRight className="size-7" aria-hidden="true" />
                </Button>
              </>
            )}
          </div>

          <p className="min-h-8 pb-1 text-center text-sm font-medium tabular-nums text-white/90" aria-live="polite">
            {activeIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </DialogContent>
  );
}
