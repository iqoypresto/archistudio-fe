"use client";

import { useCallback, useState } from "react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { uploadApi } from "@/lib/api/upload.api";
import { readPhotoTakenAt } from "@/lib/utils/photo-exif";
import {
  canSubmitPhotoQueue,
  isSupportedImageMime,
  validateSelectedPhotoFiles,
} from "@/lib/validation/upload.validation";
import type { DailyReportPhotoDto } from "@/types/api/report.types";
import type { PhotoQueueItem, SupportedImageMime } from "@/types/api/upload.types";

function mapInitialPhotos(photos?: DailyReportPhotoDto[]): PhotoQueueItem[] {
  if (!photos || photos.length === 0) return [];
  return photos.map((photo, index) => ({
    id: photo.id,
    fileName: `Foto #${index + 1}`,
    contentType: "image/jpeg",
    previewUrl: photo.signedViewUrl,
    file: new Blob(),
    status: "uploaded",
    progress: 100,
    caption: photo.caption ?? "",
    storageKey: photo.storageKey,
    takenAt: photo.takenAt,
    errorMessage: null,
  }));
}

export function applyQueueItemPatch(
  items: PhotoQueueItem[],
  itemId: string,
  patch: Partial<PhotoQueueItem>
): PhotoQueueItem[] {
  return items.map((item) => (item.id === itemId ? { ...item, ...patch } : item));
}

export function prepareRetryItem(items: PhotoQueueItem[], itemId: string): PhotoQueueItem[] {
  return applyQueueItemPatch(items, itemId, {
    status: "idle",
    progress: 0,
    errorMessage: null,
  });
}

export function removeQueueItem(items: PhotoQueueItem[], itemId: string): PhotoQueueItem[] {
  return items.filter((item) => item.id !== itemId);
}

function createInitialQueueItem(file: File): PhotoQueueItem {
  const contentType: SupportedImageMime = isSupportedImageMime(file.type)
    ? file.type
    : "image/jpeg";
  return {
    id: crypto.randomUUID(),
    fileName: file.name,
    contentType,
    previewUrl: URL.createObjectURL(file),
    file,
    status: "idle",
    progress: 0,
    caption: "",
    storageKey: null,
    takenAt: null,
    errorMessage: null,
  };
}

async function compressPhotoBlob(
  rawFile: Blob,
  contentType: SupportedImageMime
): Promise<Blob> {
  const fileObj =
    rawFile instanceof File
      ? rawFile
      : new File([rawFile], "photo.jpg", { type: contentType });
  return imageCompression(fileObj, {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: contentType,
  });
}

export function usePhotoUploadQueue(params: {
  areaId: string;
  reportDate: string;
  initialPhotos?: DailyReportPhotoDto[];
}) {
  const [items, setItems] = useState<PhotoQueueItem[]>(() =>
    mapInitialPhotos(params.initialPhotos)
  );
  const patchItem = useCallback((itemId: string, patch: Partial<PhotoQueueItem>) => {
    setItems((prev) => applyQueueItemPatch(prev, itemId, patch));
  }, []);

  const uploadSingleItem = useCallback(
    async (item: PhotoQueueItem) => {
      try {
        patchItem(item.id, { status: "compressing", progress: 10, errorMessage: null });
        const takenAt = await readPhotoTakenAt(item.file as File);
        patchItem(item.id, { takenAt });
        const compressed = await compressPhotoBlob(item.file, item.contentType);
        patchItem(item.id, { status: "signing", progress: 25 });
        const [signed] = await uploadApi.signUploadUrls({
          areaId: params.areaId,
          reportDate: params.reportDate,
          files: [{ contentType: item.contentType, fileSizeBytes: compressed.size }],
        });
        if (!signed) throw new Error("Presigned URL tidak tersedia.");
        patchItem(item.id, { status: "uploading", storageKey: signed.storageKey, progress: 35 });
        await uploadApi.putFileToSignedUrl({
          uploadUrl: signed.uploadUrl,
          file: compressed,
          contentType: item.contentType,
          onProgress: (pct) => patchItem(item.id, { progress: Math.max(35, pct) }),
        });
        patchItem(item.id, { status: "uploaded", progress: 100 });
      } catch (err) {
        const msg =
          err instanceof Error && err.message
            ? err.message
            : "Gagal mengunggah foto. Periksa sinyal HP lalu tekan Ulangi Foto Ini.";
        patchItem(item.id, { status: "failed", errorMessage: msg });
        toast.error(`Foto "${item.fileName}" gagal diunggah.`);
      }
    },
    [params.areaId, params.reportDate, patchItem]
  );

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const files = Array.from(incoming);
      if (files.length === 0) return;
      const check = validateSelectedPhotoFiles(items.length, files);
      if (!check.ok) {
        toast.error(check.message);
        return;
      }
      const nextItems = files.map(createInitialQueueItem);
      setItems((prev) => [...prev, ...nextItems]);
      nextItems.forEach((item) => void uploadSingleItem(item));
    },
    [items.length, uploadSingleItem]
  );

  const retryPhoto = useCallback(
    (itemId: string) => {
      const target = items.find((item) => item.id === itemId);
      if (!target) return;
      setItems((prev) => prepareRetryItem(prev, itemId));
      void uploadSingleItem({ ...target, status: "idle", progress: 0, errorMessage: null });
    },
    [items, uploadSingleItem]
  );

  const updateCaption = useCallback(
    (itemId: string, caption: string) => patchItem(itemId, { caption }),
    [patchItem]
  );

  const removePhoto = useCallback((itemId: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === itemId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return removeQueueItem(prev, itemId);
    });
  }, []);

  return {
    items,
    submitReadiness: canSubmitPhotoQueue(items),
    addFiles,
    retryPhoto,
    updateCaption,
    removePhoto,
  };
}
