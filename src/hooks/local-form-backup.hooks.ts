import { useCallback } from "react";
import type { ReportFormValues } from "@/lib/validation/report.validation";
import type { ReportPhotoInput } from "@/types/api/report.types";

export interface DraftBackupPayload {
  values: Partial<ReportFormValues>;
  uploadedPhotos: ReportPhotoInput[];
  savedAt: string;
}

export function buildDraftBackupKey(areaId: string, reportDate: string): string {
  return `draft-backup:${areaId}:${reportDate}`;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function readDraftBackup(key: string): DraftBackupPayload | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed as DraftBackupPayload;
  } catch {
    return null;
  }
}

export function writeDraftBackup(key: string, payload: DraftBackupPayload): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(payload));
  } catch {
    // Abaikan bila kuota storage HP penuh agar tidak mengganggu form
  }
}

export function clearDraftBackup(key: string): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(key);
}

export function useLocalFormBackup(areaId: string, reportDate: string) {
  const key = buildDraftBackupKey(areaId, reportDate);

  const loadBackup = useCallback(() => readDraftBackup(key), [key]);

  const saveBackup = useCallback(
    (values: Partial<ReportFormValues>, uploadedPhotos: ReportPhotoInput[]) => {
      if (!areaId || !reportDate) return;
      writeDraftBackup(key, {
        values,
        uploadedPhotos,
        savedAt: new Date().toISOString(),
      });
    },
    [areaId, key, reportDate]
  );

  const removeBackup = useCallback(() => {
    clearDraftBackup(key);
  }, [key]);

  return { backupKey: key, loadBackup, saveBackup, removeBackup };
}
