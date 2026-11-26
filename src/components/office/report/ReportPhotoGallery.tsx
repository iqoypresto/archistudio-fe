"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StoredFileImage } from "@/components/ui/StoredFileImage";
import type { DailyReportPhotoDto } from "@/types/api/report.types";

function formatPhotoTime(value: string | null, fallback: string, timeZone: string): string {
  if (!value) return fallback;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(value))
    .replace(".", ":");
}

export function ReportPhotoGallery({
  photos,
  timeZone,
}: {
  photos: DailyReportPhotoDto[];
  timeZone: string;
}) {
  const [zoomPhoto, setZoomPhoto] = useState<DailyReportPhotoDto | null>(null);

  return (
    <>
      <section className="rounded-xl border border-border bg-surface tabular-nums">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-text-primary">
            Dokumentasi Foto ({photos.length})
          </h2>
          <span className="text-xs text-text-muted">Klik foto untuk memperbesar</span>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              aria-label={`Buka foto ${photo.caption ?? index + 1}`}
              onClick={() => setZoomPhoto(photo)}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface-input/50 text-left transition-colors hover:border-white/18"
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
                      {formatPhotoTime(
                        photo.takenAt,
                        "Waktu pengambilan tidak tersedia",
                        timeZone,
                      )}
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

      <Dialog open={Boolean(zoomPhoto)} onOpenChange={(open) => !open && setZoomPhoto(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{zoomPhoto?.caption || "Pratinjau Foto Laporan"}</DialogTitle>
          </DialogHeader>
          {zoomPhoto && (
            <div className="space-y-3">
              <StoredFileImage
                contentPath={zoomPhoto.contentPath}
                alt={zoomPhoto.caption ?? "Foto"}
                variant="full"
                eager
                className="max-h-[65vh] w-full rounded-lg bg-canvas object-contain"
                fallbackClassName="min-h-64 w-full"
              />
              <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-canvas/60 px-3.5 py-2.5 text-xs tabular-nums sm:grid-cols-2">
                <div>
                  <span className="text-text-muted">Diambil: </span>
                  <span className="text-text-primary">
                    {formatPhotoTime(
                      zoomPhoto.takenAt,
                      "Waktu pengambilan tidak tersedia",
                      timeZone,
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Diunggah: </span>
                  <span className="text-text-primary">
                    {formatPhotoTime(zoomPhoto.uploadedAt, "Tidak tercatat", timeZone)}
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
