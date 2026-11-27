"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadApi } from "@/lib/api/upload.api";
import { applyQueueItemPatch, prepareCancellableReportPhoto, prepareRetryItem, removeQueueItem, requireQueueReselection, restoreReportPhotoQueue } from "@/lib/utils/report-photo-queue";
import type { PersistedReportPhoto } from "@/lib/session/supervisor-report-session";
import { canSubmitPhotoQueue, validateSelectedPhotoFiles } from "@/lib/validation/upload.validation";
import type { PhotoQueueItem, SupportedImageMime } from "@/types/api/upload.types";
export { applyQueueItemPatch, prepareRetryItem, removeQueueItem };

export function usePhotoUploadQueue(params: { areaId: string; reportDate: string }) {
  const [items, setItems] = useState<PhotoQueueItem[]>([]);
  const currentItems = useRef(items);
  const compressionControllers = useRef(new Map<string, AbortController>());
  useEffect(() => { currentItems.current = items; }, [items]);
  useEffect(() => () => {
    for (const controller of compressionControllers.current.values()) controller.abort();
    compressionControllers.current.clear();
    for (const item of currentItems.current) {
      if (item.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
    }
  }, []);

  const updateItems = useCallback((updater: (current: PhotoQueueItem[]) => PhotoQueueItem[]) => {
    setItems((current) => {
      const next = updater(current);
      currentItems.current = next;
      return next;
    });
  }, []);
  const patch = useCallback((id: string, change: Partial<PhotoQueueItem>) => {
    updateItems((current) => applyQueueItemPatch(current, id, change));
  }, [updateItems]);

  const uploadItem = useCallback(async (item: PhotoQueueItem, sessionId: string, photoOrder: number, signal?: AbortSignal): Promise<PhotoQueueItem | null> => {
    if (item.storedFileId) return item;
    if (!item.file) return null;
    try {
      if (item.uploadSessionId) await uploadApi.cancelSession(item.uploadSessionId, "field");
      patch(item.id, { status: "signing", progress: 0, errorMessage: null });
      patch(item.id, { status: "uploading", progress: 0 });
      const completed = await uploadApi.uploadFile(
        { reportSessionId: sessionId, areaId: params.areaId, reportDate: params.reportDate, photoOrder },
        item.file, item.contentType,
        (progress) => patch(item.id, { progress }),
        item.fileName,
        undefined,
        (receipt) => patch(item.id, { uploadSessionId: receipt.uploadSessionId }),
        signal,
      );
      const uploaded = {
        ...item,
        status: "uploaded" as const,
        progress: 100,
        storedFileId: completed.storedFileId,
        uploadSessionId: completed.uploadSessionId,
      };
      patch(item.id, uploaded);
      return uploaded;
    } catch (error) {
      if (signal?.aborted) {
        patch(item.id, { status: "failed", progress: 0, errorMessage: "Unggahan dibatalkan. Anda dapat mencoba lagi." });
        return null;
      }
      patch(item.id, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Gagal mengunggah foto.",
      });
      return null;
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
      file, status: "compressing", progress: 10, caption: "", storedFileId: null, uploadSessionId: null,
      takenAt: null, errorMessage: null,
    }));
    updateItems((current) => [...current, ...pending]);
    return Promise.all(pending.map(async (item) => {
      try {
        const prepared = await prepareCancellableReportPhoto(item.file as File, item.id, compressionControllers.current);
        URL.revokeObjectURL(item.previewUrl);
        updateItems((current) => applyQueueItemPatch(current, item.id, prepared));
        return prepared;
      } catch {
        const failed = { ...item, status: "failed" as const, errorMessage: "Gagal menyiapkan foto." };
        updateItems((current) => applyQueueItemPatch(current, item.id, failed));
        return failed;
      }
    }));
  }, [updateItems]);

  const replacePhotoFile = useCallback(async (id: string, file: File): Promise<void> => {
    const current = currentItems.current.find((item) => item.id === id);
    if (!current) return;
    const check = validateSelectedPhotoFiles(0, [file]);
    if (!check.ok) { toast.error(check.message); return; }

    if (current.uploadSessionId) void uploadApi.cancelSession(current.uploadSessionId, "field").catch(() => undefined);
    if (current.previewUrl.startsWith("blob:")) URL.revokeObjectURL(current.previewUrl);
    const previewUrl = URL.createObjectURL(file);
    const pending: PhotoQueueItem = {
      ...current,
      fileName: file.name,
      contentType: file.type as SupportedImageMime,
      previewUrl,
      file,
      status: "compressing",
      progress: 10,
      storedFileId: null,
      uploadSessionId: null,
      takenAt: null,
      errorMessage: null,
    };
    patch(id, pending);

    try {
      const prepared = await prepareCancellableReportPhoto(file, id, compressionControllers.current);
      URL.revokeObjectURL(previewUrl);
      patch(id, { ...prepared, caption: current.caption });
    } catch {
      patch(id, { status: "failed", progress: 0, errorMessage: "Gagal menyiapkan foto." });
    }
  }, [patch]);

  const uploadItems = useCallback(async (selected: PhotoQueueItem[], sessionId: string, signal?: AbortSignal): Promise<PhotoQueueItem[] | null> => {
    const results = await Promise.all(selected.map((item, index) => uploadItem(item, sessionId, index + 1, signal)));
    const uploadedItems: PhotoQueueItem[] = [];
    for (const item of results) {
      if (!item) return null;
      uploadedItems.push(item);
    }
    return uploadedItems;
  }, [uploadItem]);

  const retryPhoto = useCallback(async (id: string, sessionId?: string) => {
    let item = currentItems.current.find((photo) => photo.id === id);
    if (!item?.file) return;
    if (item.errorMessage === "Gagal menyiapkan foto." && item.file instanceof File) {
      patch(id, { status: "compressing", progress: 10, errorMessage: null });
      try {
        const oldPreview = item.previewUrl;
        item = await prepareCancellableReportPhoto(item.file, item.id, compressionControllers.current);
        if (oldPreview.startsWith("blob:")) URL.revokeObjectURL(oldPreview);
        patch(id, item);
      } catch {
        patch(id, { status: "failed", errorMessage: "Gagal menyiapkan foto." });
        return;
      }
    }
    if (sessionId) {
      const photoOrder = currentItems.current.findIndex((photo) => photo.id === id) + 1;
      await uploadItem(item, sessionId, Math.max(photoOrder, 1));
    }
  }, [patch, uploadItem]);

  const updateCaption = useCallback((id: string, caption: string) => patch(id, { caption }), [patch]);
  const removePhoto = useCallback(async (id: string) => {
    compressionControllers.current.get(id)?.abort();
    compressionControllers.current.delete(id);
    const removed = currentItems.current.find((item) => item.id === id);
    if (removed?.uploadSessionId) {
      try {
        await uploadApi.cancelSession(removed.uploadSessionId, "field");
      } catch {
        toast.error("File belum dapat dilepas dari sesi laporan. Coba hapus lagi.");
        return;
      }
    }
    updateItems((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }, [updateItems]);

  const restoreItems = useCallback((saved: PersistedReportPhoto[]) => {
    updateItems(() => restoreReportPhotoQueue(saved));
  }, [updateItems]);

  const requireReselection = useCallback(() => {
    updateItems(requireQueueReselection);
  }, [updateItems]);

  return {
    items,
    submitReadiness: useMemo(() => canSubmitPhotoQueue(items), [items]),
    addFiles,
    uploadItems,
    replacePhotoFile,
    retryPhoto,
    updateCaption,
    removePhoto,
    restoreItems,
    requireReselection,
  };
}
