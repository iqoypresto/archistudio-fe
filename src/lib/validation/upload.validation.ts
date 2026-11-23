import type { SupportedImageMime, UploadQueueStatus } from "@/types/api/upload.types";

export const MIN_REPORT_PHOTOS = 1;
export const MAX_REPORT_PHOTOS = 10;

export const ALLOWED_IMAGE_MIMES: readonly SupportedImageMime[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export interface FileInputSummary {
  name: string;
  type: string;
  size: number;
}

export type PhotoSelectionValidationResult =
  | { ok: true }
  | {
      ok: false;
      code: "INVALID_PHOTO_COUNT" | "UNSUPPORTED_FILE_TYPE";
      message: string;
    };

export function isSupportedImageMime(mime: string): mime is SupportedImageMime {
  return (ALLOWED_IMAGE_MIMES as readonly string[]).includes(mime);
}

export function validateSelectedPhotoFiles(
  currentCount: number,
  incomingFiles: ReadonlyArray<FileInputSummary>
): PhotoSelectionValidationResult {
  const totalAfterAdd = currentCount + incomingFiles.length;
  if (totalAfterAdd < MIN_REPORT_PHOTOS || totalAfterAdd > MAX_REPORT_PHOTOS) {
    return {
      ok: false,
      code: "INVALID_PHOTO_COUNT",
      message: "Jumlah foto laporan harus antara 1 sampai 10 foto.",
    };
  }
  const unsupported = incomingFiles.find((file) => !isSupportedImageMime(file.type));
  if (unsupported) {
    return {
      ok: false,
      code: "UNSUPPORTED_FILE_TYPE",
      message: `Format "${unsupported.name}" tidak didukung. Gunakan JPG, PNG, atau WebP.`,
    };
  }
  return { ok: true };
}

export function canSubmitPhotoQueue(
  items: ReadonlyArray<{ status: UploadQueueStatus }>
): { ready: boolean; reason?: string } {
  if (items.length < MIN_REPORT_PHOTOS || items.length > MAX_REPORT_PHOTOS) {
    return { ready: false, reason: "Jumlah foto laporan harus antara 1 sampai 10 foto." };
  }
  if (items.some((item) => item.status === "failed")) {
    return {
      ready: false,
      reason: "Masih ada foto gagal diunggah. Tekan Ulangi Foto Ini atau hapus foto tersebut.",
    };
  }
  if (items.some((item) => item.status !== "uploaded")) {
    return { ready: false, reason: "Tunggu semua foto berhasil diunggah terlebih dahulu." };
  }
  return { ready: true };
}
