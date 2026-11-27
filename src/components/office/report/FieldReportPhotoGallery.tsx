"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { StoredFileImage } from "@/components/ui/StoredFileImage";
import { formatShortTimezone } from "@/lib/utils/office-format";
import type { DailyReportPhotoDto } from "@/types/api/report.types";
import { ReportDetailSectionCard } from "./ReportDetailSectionCard";
import { ReportPhotoPreviewDialog } from "./ReportPhotoPreviewDialog";

function formatPhotoTime(value: string | null, timeZone: string): string {
  if (!value) return "Tidak tercatat";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tidak tercatat";

  try {
    const formatted = new Intl.DateTimeFormat("id-ID", {
      timeZone,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date).replace(".", ":");
    return `${formatted} ${formatShortTimezone(timeZone)}`;
  } catch {
    return "Tidak tercatat";
  }
}

function PhotoTile({
  photo,
  index,
  timeZone,
  onOpen,
}: {
  photo: DailyReportPhotoDto;
  index: number;
  timeZone: string;
  onOpen: () => void;
}) {
  const caption = photo.caption?.trim();
  const label = caption || `Foto ${index + 1}`;

  return (
    <DialogTrigger
      onClick={onOpen}
      render={
        <button
          type="button"
          aria-label={`Buka pratinjau foto ${index + 1}${caption ? `: ${caption}` : ""}`}
          className="group flex min-w-0 flex-col overflow-hidden rounded-xl bg-transparent text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9c471d] focus-visible:ring-offset-2"
        />
      }
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#f7eee8]">
        <StoredFileImage
          contentPath={photo.contentPath}
          alt={label}
          variant="thumb"
          className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          fallbackClassName="size-full"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1 px-1.5 pb-1 pt-1">
        <p className="break-words whitespace-pre-wrap text-xs font-medium leading-4 text-[#1d1c1b]">
          {caption || `Foto ${index + 1}`}
        </p>
        {(photo.takenAt || photo.uploadedAt) && (
          <dl className="space-y-0.5 text-[10px] leading-3.5 text-[#71665f]">
            {photo.takenAt && (
              <div>
                <dt className="inline">Diambil: </dt>
                <dd className="inline break-words">{formatPhotoTime(photo.takenAt, timeZone)}</dd>
              </div>
            )}
            {photo.uploadedAt && (
              <div>
                <dt className="inline">Diunggah: </dt>
                <dd className="inline break-words">{formatPhotoTime(photo.uploadedAt, timeZone)}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </DialogTrigger>
  );
}

export function FieldReportPhotoGallery({
  photos,
  timeZone,
}: {
  photos: DailyReportPhotoDto[];
  timeZone: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <Dialog
      open={activeIndex !== null}
      onOpenChange={(open) => {
        if (!open) setActiveIndex(null);
      }}
    >
      <ReportDetailSectionCard
        title="Foto"
        trailing={<span className="shrink-0 text-xs font-medium text-[#6b605c]">{photos.length} foto</span>}
        contentClassName="p-2.5"
      >
        {photos.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg bg-[#fff9f4] px-3 py-3 text-sm text-[#6b605c]">
            <ImageIcon className="size-5 shrink-0 text-[#9c471d]" aria-hidden="true" />
            <p>Belum ada foto dokumentasi untuk laporan ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-2">
            {photos.map((photo, index) => (
              <PhotoTile
                key={photo.id}
                photo={photo}
                index={index}
                timeZone={timeZone}
                onOpen={() => setActiveIndex(index)}
              />
            ))}
          </div>
        )}
      </ReportDetailSectionCard>

      <ReportPhotoPreviewDialog
        photos={photos}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    </Dialog>
  );
}
