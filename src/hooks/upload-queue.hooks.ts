"use client";
import { useCallback, useMemo, useState } from "react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { uploadApi } from "@/lib/api/upload.api";
import { readPhotoTakenAt } from "@/lib/utils/photo-exif";
import { canSubmitPhotoQueue, isSupportedImageMime, validateSelectedPhotoFiles } from "@/lib/validation/upload.validation";
import type { LocalPhoto } from "@/lib/storage/local-report";
import type { DailyReportDetail, ReportPhotoInput } from "@/types/api/report.types";
import type { PhotoQueueItem, SupportedImageMime } from "@/types/api/upload.types";

export function applyQueueItemPatch(items: PhotoQueueItem[], id: string,
  change: Partial<PhotoQueueItem>): PhotoQueueItem[] {
  return items.map((item) => item.id === id ? { ...item, ...change } : item);
}
export function prepareRetryItem(items: PhotoQueueItem[], id: string): PhotoQueueItem[] {
  return applyQueueItemPatch(items, id, {
    status: "idle", progress: 0, errorMessage: null, storageKey: null,
  });
}
export function removeQueueItem(items: PhotoQueueItem[], id: string): PhotoQueueItem[] {
  return items.filter((item) => item.id !== id);
}

function existingItems(photos?: DailyReportDetail["photos"]): PhotoQueueItem[] {
  return (photos ?? []).map((photo): PhotoQueueItem => ({ id: photo.id, fileName: "Foto tersimpan",
    contentType: "image/jpeg", previewUrl: photo.signedViewUrl, file: new Blob(),
    status: "uploaded", progress: 100, caption: photo.caption ?? "",
    storageKey: photo.storageKey, takenAt: photo.takenAt, errorMessage: null }));
}
function fromLocal(photo: LocalPhoto): PhotoQueueItem {
  return { ...photo, previewUrl: URL.createObjectURL(photo.file),
    status: photo.storageKey ? "uploaded" : "local", progress: 100, errorMessage: null };
}
function toLocal(item: PhotoQueueItem): LocalPhoto {
  return { id: item.id, fileName: item.fileName, contentType: item.contentType,
    file: item.file, caption: item.caption, takenAt: item.takenAt, storageKey: item.storageKey };
}
async function prepareFile(file: File, id: string): Promise<PhotoQueueItem> {
  const contentType: SupportedImageMime = isSupportedImageMime(file.type) ? file.type : "image/jpeg";
  const takenAt = await readPhotoTakenAt(file);
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.8, maxWidthOrHeight: 1600, useWebWorker: true, fileType: contentType,
  });
  return { id, fileName: file.name, contentType,
    previewUrl: URL.createObjectURL(compressed), file: compressed,
    status: "local", progress: 100, caption: "", storageKey: null,
    takenAt, errorMessage: null };
}

export function usePhotoUploadQueue(params: {
  areaId: string; reportDate: string; initialPhotos?: DailyReportDetail["photos"];
}) {
  const [items, setItems] = useState<PhotoQueueItem[]>(() => existingItems(params.initialPhotos));
  const patch = useCallback((id: string, change: Partial<PhotoQueueItem>) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...change } : item));
  }, []);
  const addFiles = useCallback(async (incoming: FileList | File[]) => {
    const files = Array.from(incoming);
    if (!files.length) return;
    const check = validateSelectedPhotoFiles(items.length, files);
    if (!check.ok) { toast.error(check.message); return; }
    const pending: PhotoQueueItem[] = files.map((file) => ({
      id: crypto.randomUUID(), fileName: file.name,
      contentType: file.type as SupportedImageMime,
      previewUrl: URL.createObjectURL(file), file, status: "compressing",
      progress: 10, caption: "", storageKey: null, takenAt: null, errorMessage: null,
    }));
    setItems((current) => [...current, ...pending]);
    await Promise.all(pending.map(async (item) => {
      try {
        const prepared = await prepareFile(item.file as File, item.id);
        URL.revokeObjectURL(item.previewUrl);
        patch(item.id, prepared);
      } catch {
        patch(item.id, { status: "failed", errorMessage: "Gagal menyiapkan foto." });
      }
    }));
  }, [items.length, patch]);
  const restoreItems = useCallback((photos: LocalPhoto[]) => {
    setItems((current) => {
      const ids = new Set(current.map((item) => item.id));
      return [...current, ...photos.filter((photo) => !ids.has(photo.id)).map(fromLocal)];
    });
  }, []);
  const retryPhoto = useCallback(async (id: string) => {
    const item = items.find((photo) => photo.id === id);
    if (!item) return;
    if (item.errorMessage === "Gagal menyiapkan foto." && item.file instanceof File) {
      patch(id, { status: "compressing", progress: 10, errorMessage: null });
      try {
        const prepared = await prepareFile(item.file, id);
        URL.revokeObjectURL(item.previewUrl);
        patch(id, prepared);
      } catch { patch(id, { status: "failed", errorMessage: "Gagal menyiapkan foto." }); }
      return;
    }
    patch(id, { status: "local", progress: 100, errorMessage: null, storageKey: null });
  }, [items, patch]);
  const updateCaption = useCallback((id: string, caption: string) => patch(id, { caption }), [patch]);
  const removePhoto = useCallback((id: string) => {
    setItems((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }, []);
  const uploadAll = useCallback(async (sessionId: string): Promise<ReportPhotoInput[]> => {
    const result: ReportPhotoInput[] = [];
    for (const [index, item] of items.entries()) {
      let storageKey = item.storageKey;
      if (!storageKey) {
        try {
          patch(item.id, { status: "signing", progress: 10 });
          const [signed] = await uploadApi.signUploadUrls({
            areaId: params.areaId, reportDate: params.reportDate, sessionId,
            files: [{ contentType: item.contentType, fileSizeBytes: item.file.size }],
          });
          if (!signed) throw new Error("URL unggah foto tidak tersedia.");
          patch(item.id, { status: "uploading", progress: 20 });
          await uploadApi.putFileToSignedUrl({ uploadUrl: signed.uploadUrl,
            file: item.file, contentType: item.contentType,
            onProgress: (progress) => patch(item.id, { progress }),
          });
          storageKey = signed.storageKey;
          patch(item.id, { status: "uploaded", progress: 100, storageKey });
        } catch (error) {
          patch(item.id, { status: "failed", errorMessage:
            error instanceof Error ? error.message : "Gagal mengunggah foto." });
          throw error;
        }
      }
      result.push({ storageKey, caption: item.caption.trim() || null,
        sortOrder: index, takenAt: item.takenAt });
    }
    return result;
  }, [items, params.areaId, params.reportDate, patch]);
  const localPhotos = useMemo(() => items.filter((item) => item.file.size > 0 &&
    item.status !== "compressing").map(toLocal), [items]);
  return { items, submitReadiness: canSubmitPhotoQueue(items), addFiles, restoreItems,
    retryPhoto, updateCaption, removePhoto, uploadAll, localPhotos };
}
