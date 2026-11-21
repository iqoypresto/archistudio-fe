"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
            <Button
              key={photo.id}
              type="button"
              variant="ghost"
              aria-label={`Buka foto ${photo.caption ?? index + 1}`}
              onClick={() => setZoomPhoto(photo)}
              className="group h-auto w-full flex-col items-stretch overflow-hidden rounded-xl border border-border/80 bg-surface-input/70 p-0 text-left transition-colors hover:border-white/[0.14] hover:bg-surface-input/70"
            >
              <Image
                src={photo.signedViewUrl || "/file.svg"}
                alt={photo.caption ?? `Foto ${index + 1}`}
                width={320}
                height={240}
                unoptimized
                className="aspect-4/3 w-full object-cover transition-transform group-hover:scale-105"
              />
              <p className="truncate px-3 pt-2.5 pb-1 text-xs font-medium text-text-primary">
                {photo.caption || `Foto #${index + 1}`}
              </p>
              <div className="space-y-0.5 px-3 pb-2.5 text-[11px] text-text-muted">
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
            </Button>
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
