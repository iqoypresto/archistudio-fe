"use client";

import { useCallback, useState } from "react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { uploadApi } from "@/lib/api/upload.api";
import {
  canSubmitPhotoQueue,
  isSupportedImageMime,
  validateSelectedPhotoFiles,
} from "@/lib/validation/upload.validation";
import type { PhotoQueueItem, SupportedImageMime } from "@/types/api/upload.types";

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
    takenAt: new Date(file.lastModified || Date.now()).toISOString(),
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

export function usePhotoUploadQueue(params: { areaId: string; reportDate: string }) {
  const [items, setItems] = useState<PhotoQueueItem[]>([]);
  const patchItem = useCallback((itemId: string, patch: Partial<PhotoQueueItem>) => {
    setItems((prev) => applyQueueItemPatch(prev, itemId, patch));
  }, []);

  const uploadSingleItem = useCallback(
    async (item: PhotoQueueItem) => {
      try {
        patchItem(item.id, { status: "compressing", progress: 10, errorMessage: null });
        const compressed = await compressPhotoBlob(item.file, item.contentType);
        patchItem(item.id, { file: compressed, status: "signing", progress: 25 });
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
