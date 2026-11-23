"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { uploadApi } from "@/lib/api/upload.api";
import { readPhotoTakenAt } from "@/lib/utils/photo-exif";
import { canSubmitPhotoQueue, isSupportedImageMime, validateSelectedPhotoFiles } from "@/lib/validation/upload.validation";
import type { ReportPhotoInput } from "@/types/api/report.types";
import type { PhotoQueueItem, SupportedImageMime } from "@/types/api/upload.types";

export function applyQueueItemPatch(items: PhotoQueueItem[], id: string, change: Partial<PhotoQueueItem>) {
  return items.map((item) => item.id === id ? { ...item, ...change } : item);
}

export function prepareRetryItem(items: PhotoQueueItem[], id: string): PhotoQueueItem[] {
  return applyQueueItemPatch(items, id, { status: "idle", progress: 0, errorMessage: null, storageKey: null });
}

export function removeQueueItem(items: PhotoQueueItem[], id: string): PhotoQueueItem[] {
  return items.filter((item) => item.id !== id);
}

async function prepareFile(file: File, id: string): Promise<PhotoQueueItem> {
  const contentType: SupportedImageMime = isSupportedImageMime(file.type) ? file.type : "image/jpeg";
  const takenAt = await readPhotoTakenAt(file);
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.8, maxWidthOrHeight: 1600, useWebWorker: true, fileType: contentType,
  });
  return {
    id, fileName: file.name, contentType, previewUrl: URL.createObjectURL(compressed),
    file: compressed, status: "local", progress: 100, caption: "", storageKey: null,
    takenAt, errorMessage: null,
  };
}

export function buildReportPhotoInputs(items: PhotoQueueItem[]): ReportPhotoInput[] {
  return items.map((item, sortOrder) => {
    if (!item.storageKey) throw new Error("Tunggu semua foto berhasil diunggah.");
    return {
      storageKey: item.storageKey, caption: item.caption.trim() || null,
      sortOrder, takenAt: item.takenAt,
    };
  });
}

export function usePhotoUploadQueue(params: { areaId: string; reportDate: string }) {
  const [items, setItems] = useState<PhotoQueueItem[]>([]);
  const currentItems = useRef(items);
  useEffect(() => { currentItems.current = items; }, [items]);
  useEffect(() => () => {
    for (const item of currentItems.current) {
      if (item.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
    }
  }, []);

  const patch = useCallback((id: string, change: Partial<PhotoQueueItem>) => {
    setItems((current) => applyQueueItemPatch(current, id, change));
  }, []);

  const uploadItem = useCallback(async (item: PhotoQueueItem, sessionId: string) => {
    if (item.storageKey) return;
    try {
      patch(item.id, { status: "signing", progress: 10, errorMessage: null });
      const [signed] = await uploadApi.signUploadUrls({
        areaId: params.areaId, reportDate: params.reportDate, sessionId,
        files: [{ contentType: item.contentType, fileSizeBytes: item.file.size }],
      });
      if (!signed) throw new Error("URL unggah foto tidak tersedia.");
      patch(item.id, { status: "uploading", progress: 20 });
      await uploadApi.putFileToSignedUrl({
        uploadUrl: signed.uploadUrl, file: item.file, contentType: item.contentType,
        onProgress: (progress) => patch(item.id, { progress }),
      });
      patch(item.id, { status: "uploaded", progress: 100, storageKey: signed.storageKey });
    } catch (error) {
      patch(item.id, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Gagal mengunggah foto.",
      });
    }
  }, [params.areaId, params.reportDate, patch]);

  const addFiles = useCallback(async (incoming: FileList | File[]): Promise<PhotoQueueItem[]> => {
    const files = Array.from(incoming);
    if (!files.length) return [];
    const check = validateSelectedPhotoFiles(currentItems.current.length, files);
    if (!check.ok) { toast.error(check.message); return []; }
    const pending: PhotoQueueItem[] = files.map((file) => ({
      id: crypto.randomUUID(), fileName: file.name,
      contentType: file.type as SupportedImageMime, previewUrl: URL.createObjectURL(file),
      file, status: "compressing", progress: 10, caption: "", storageKey: null,
      takenAt: null, errorMessage: null,
    }));
    setItems((current) => [...current, ...pending]);
    return Promise.all(pending.map(async (item) => {
      try {
        const prepared = await prepareFile(item.file as File, item.id);
        URL.revokeObjectURL(item.previewUrl);
        setItems((current) => applyQueueItemPatch(current, item.id, prepared));
        return prepared;
      } catch {
        const failed = { ...item, status: "failed" as const, errorMessage: "Gagal menyiapkan foto." };
        setItems((current) => applyQueueItemPatch(current, item.id, failed));
        return failed;
      }
    }));
  }, []);

  const uploadItems = useCallback(async (selected: PhotoQueueItem[], sessionId: string) => {
    await Promise.all(selected.filter((item) => !item.storageKey && item.status !== "failed")
      .map((item) => uploadItem(item, sessionId)));
  }, [uploadItem]);

  const retryPhoto = useCallback(async (id: string, sessionId: string) => {
    let item = currentItems.current.find((photo) => photo.id === id);
    if (!item) return;
    if (item.errorMessage === "Gagal menyiapkan foto." && item.file instanceof File) {
      patch(id, { status: "compressing", progress: 10, errorMessage: null });
      try {
        const oldPreview = item.previewUrl;
        item = await prepareFile(item.file, item.id);
        if (oldPreview.startsWith("blob:")) URL.revokeObjectURL(oldPreview);
        patch(id, item);
      } catch {
        patch(id, { status: "failed", errorMessage: "Gagal menyiapkan foto." });
        return;
      }
    }
    await uploadItem(item, sessionId);
  }, [patch, uploadItem]);

  const updateCaption = useCallback((id: string, caption: string) => patch(id, { caption }), [patch]);
  const removePhoto = useCallback((id: string) => {
    setItems((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }, []);

  return {
    items,
    submitReadiness: useMemo(() => canSubmitPhotoQueue(items), [items]),
    addFiles,
    uploadItems,
    retryPhoto,
    updateCaption,
    removePhoto,
  };
}
