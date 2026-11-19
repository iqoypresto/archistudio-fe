"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DailyReportPhotoDto } from "@/types/api/report.types";

function formatPhotoTime(value: string | null, fallback: string, timeZone: string): string {
  if (!value) return fallback;
  return new Intl.DateTimeFormat("id-ID", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
      <Card className="border border-border bg-surface">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Dokumentasi Foto ({photos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setZoomPhoto(photo)}
              className="group overflow-hidden rounded-xl border border-border bg-canvas text-left"
            >
              <Image
                src={photo.signedViewUrl || "/file.svg"}
                alt={photo.caption ?? `Foto ${index + 1}`}
                width={320}
                height={240}
                unoptimized
                className="aspect-4/3 w-full object-cover transition-transform group-hover:scale-105"
              />
              <p className="truncate px-2.5 py-2 text-xs text-text-secondary">
                {photo.caption || `Foto #${index + 1}`}
              </p>
              <div className="space-y-1 px-2.5 pb-2.5 text-xs text-text-secondary">
                <p>
                  Diambil: {formatPhotoTime(
                    photo.takenAt,
                    "Waktu pengambilan tidak tersedia",
                    timeZone,
                  )}
                </p>
                <p>
                  Diunggah: {formatPhotoTime(
                    photo.uploadedAt,
                    "Waktu unggah tidak tercatat",
                    timeZone,
                  )}
                </p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
      <Dialog open={Boolean(zoomPhoto)} onOpenChange={(open) => !open && setZoomPhoto(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{zoomPhoto?.caption || "Pratinjau Foto Laporan"}</DialogTitle>
          </DialogHeader>
          {zoomPhoto && (
            <Image
              src={zoomPhoto.signedViewUrl || "/file.svg"}
              alt={zoomPhoto.caption ?? "Foto"}
              width={900}
              height={675}
              unoptimized
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
