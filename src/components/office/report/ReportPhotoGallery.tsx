"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
import type { DailyReportPhotoDto } from "@/types/api/report.types";

function formatPhotoTime(value: string | null, fallback: string, timeZone: string): string {
  if (!value) return fallback;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone, day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(value)).replace(".", ":");
}

export function ReportPhotoGallery({
  photos,
  timeZone,
}: {
  photos: DailyReportPhotoDto[];
  timeZone: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activePhoto = activeIndex === null ? null : (photos[activeIndex] ?? null);

  useEffect(() => {
    if (activeIndex === null || photos.length < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      setActiveIndex((cur) => (cur === null ? null : (cur + (event.key === "ArrowRight" ? 1 : -1) + photos.length) % photos.length));
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, photos.length]);

  const stepPhoto = (dir: -1 | 1) =>
    setActiveIndex((cur) => (cur === null || photos.length < 2 ? cur : (cur + dir + photos.length) % photos.length));

  return (
    <>
      <section className="rounded-xl border border-border bg-surface tabular-nums">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3.5 sm:px-5">
          <h2 className="text-sm font-semibold text-text-primary">
            Dokumentasi Foto ({photos.length})
          </h2>
          <span className="text-xs text-text-muted">Ketuk foto untuk memperbesar</span>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              aria-label={`Buka foto ${photo.caption ?? index + 1}`}
              onClick={() => setActiveIndex(index)}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface-input/50 text-left transition-colors hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="overflow-hidden bg-canvas">
                <StoredFileImage
                  contentPath={photo.contentPath}
                  alt={photo.caption ?? `Foto ${index + 1}`}
                  variant="thumb"
                  className="aspect-4/3 w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  fallbackClassName="aspect-4/3 w-full"
                />
              </div>
              <div className="space-y-1.5 p-3">
                <p className="truncate text-xs font-medium text-text-primary">
                  {photo.caption || `Foto #${index + 1}`}
                </p>
                <div className="space-y-0.5 text-[11px] text-text-muted">
                  <p>
                    Diambil:{" "}
                    <span className="text-text-secondary">
                      {formatPhotoTime(photo.takenAt, "Waktu pengambilan tidak tersedia", timeZone)}
                    </span>
                  </p>
                  <p>
                    Diunggah:{" "}
                    <span className="text-text-secondary">
                      {formatPhotoTime(photo.uploadedAt, "Tidak tercatat", timeZone)}
                    </span>
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <Dialog open={Boolean(activePhoto)} onOpenChange={(open) => !open && setActiveIndex(null)}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-black/95 supports-backdrop-filter:backdrop-blur-[2px]"
          className="fixed inset-0 top-0 left-0 z-50 flex h-dvh max-h-dvh w-dvw max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none bg-black p-0 text-white ring-0 sm:max-w-none"
        >
          {activePhoto && activeIndex !== null && (
            <div className="flex h-full min-h-0 w-full flex-col px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-6">
              <div className="flex min-h-12 items-center justify-between gap-3">
                <DialogHeader className="min-w-0 flex-1 gap-0.5 pr-0">
                  <DialogTitle className="truncate text-sm font-semibold text-white">
                    {activePhoto.caption || `Foto #${activeIndex + 1}`}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-white/70 tabular-nums">
                    {activeIndex + 1} / {photos.length}
                  </DialogDescription>
                </DialogHeader>
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      aria-label="Tutup pratinjau foto"
                      className="size-12 min-h-12 shrink-0 rounded-full bg-white/15 text-white hover:bg-white/25 hover:text-white focus-visible:ring-white"
                    />
                  }
                >
                  <X className="size-6" aria-hidden="true" />
                </DialogClose>
              </div>

              <div className="relative flex min-h-0 flex-1 items-center justify-center py-3">
                <StoredFileImage
                  contentPath={activePhoto.contentPath}
                  alt={activePhoto.caption ?? `Foto ${activeIndex + 1}`}
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
                      onClick={() => stepPhoto(-1)}
                      className="absolute top-1/2 left-1 size-12 min-h-12 -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white focus-visible:ring-white sm:left-3"
                    >
                      <ChevronLeft className="size-7" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      aria-label="Foto berikutnya"
                      onClick={() => stepPhoto(1)}
                      className="absolute top-1/2 right-1 size-12 min-h-12 -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white focus-visible:ring-white sm:right-3"
                    >
                      <ChevronRight className="size-7" aria-hidden="true" />
                    </Button>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs tabular-nums sm:grid-cols-2">
                <div>
                  <span className="text-white/70">Diambil: </span>
                  <span className="text-white">
                    {formatPhotoTime(activePhoto.takenAt, "Waktu pengambilan tidak tersedia", timeZone)}
                  </span>
                </div>
                <div>
                  <span className="text-white/70">Diunggah: </span>
                  <span className="text-white">
                    {formatPhotoTime(activePhoto.uploadedAt, "Tidak tercatat", timeZone)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
