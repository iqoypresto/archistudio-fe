import imageCompression from "browser-image-compression";
import { readPhotoTakenAt } from "@/lib/utils/photo-exif";
import { isSupportedImageMime } from "@/lib/validation/upload.validation";
import type { PersistedReportPhoto } from "@/lib/session/supervisor-report-session";
import type { ReportPhotoInput } from "@/types/api/report.types";
import type { PhotoQueueItem, SupportedImageMime } from "@/types/api/upload.types";

export function applyQueueItemPatch(items: PhotoQueueItem[], id: string, change: Partial<PhotoQueueItem>) {
  return items.map((item) => item.id === id ? { ...item, ...change } : item);
}

export function prepareRetryItem(items: PhotoQueueItem[], id: string): PhotoQueueItem[] {
  return applyQueueItemPatch(items, id, { status: "idle", progress: 0, errorMessage: null, storedFileId: null, uploadSessionId: null });
}

export function removeQueueItem(items: PhotoQueueItem[], id: string): PhotoQueueItem[] {
  return items.filter((item) => item.id !== id);
}

export function restoreReportPhotoQueue(saved: PersistedReportPhoto[]): PhotoQueueItem[] {
  return saved.map((photo) => ({
    ...photo,
    uploadSessionId: photo.uploadSessionId ?? null,
    previewUrl: "",
    file: null,
    status: photo.storedFileId ? "uploaded" : "failed",
    progress: photo.storedFileId ? 100 : 0,
    errorMessage: photo.storedFileId
      ? null
      : "Berkas foto tidak tersimpan saat halaman dimuat ulang. Pilih ulang foto ini untuk melanjutkan.",
  }));
}

export function requireQueueReselection(items: PhotoQueueItem[]): PhotoQueueItem[] {
  return items.map((item) => ({
    ...item,
    status: "failed",
    progress: 0,
    storedFileId: null,
    errorMessage: item.file
      ? "Sesi unggah kedaluwarsa. Tekan ulang untuk mengunggah foto ini lagi."
      : "Sesi unggah kedaluwarsa. Pilih ulang foto ini untuk melanjutkan.",
  }));
}

export async function prepareReportPhoto(file: File, id: string, signal?: AbortSignal): Promise<PhotoQueueItem> {
  const contentType: SupportedImageMime = isSupportedImageMime(file.type) ? file.type : "image/jpeg";
  const exifResult = await readPhotoTakenAt(file);
  if (signal?.aborted) throw signal.reason ?? new Error("Kompresi foto dibatalkan.");
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.8, maxWidthOrHeight: 1600, useWebWorker: true, fileType: contentType, signal,
  });
  if (signal?.aborted) throw signal.reason ?? new Error("Kompresi foto dibatalkan.");
  return {
    id, fileName: file.name, contentType, previewUrl: URL.createObjectURL(compressed),
    file: compressed, status: "local", progress: 100, caption: "", storedFileId: null, uploadSessionId: null,
    takenAt: exifResult.takenAt, errorMessage: null,
  };
}

export async function prepareCancellableReportPhoto(
  file: File,
  id: string,
  controllers: Map<string, AbortController>,
): Promise<PhotoQueueItem> {
  const controller = new AbortController();
  controllers.set(id, controller);
  try {
    return await prepareReportPhoto(file, id, controller.signal);
  } finally {
    if (controllers.get(id) === controller) controllers.delete(id);
  }
}

export function buildReportPhotoInputs(items: PhotoQueueItem[]): ReportPhotoInput[] {
  return items.map((item, sortOrder) => {
    if (!item.storedFileId) throw new Error("Tunggu semua foto berhasil diunggah.");
    return {
      storedFileId: item.storedFileId, caption: item.caption.trim() || null,
      sortOrder, takenAt: item.takenAt,
    };
  });
}
