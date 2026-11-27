import { useCallback, useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { buildDefaultReportValues, type ReportFormValues } from "@/lib/validation/report.validation";
import {
  readSupervisorReportDraft,
  removeSupervisorReportDraft,
  supervisorReportDraftKey,
  writeSupervisorReportDraft,
  type PersistedReportPhoto,
} from "@/lib/session/supervisor-report-session";
import type { PhotoQueueItem } from "@/types/api/upload.types";

type ReportStep = 1 | 2 | 3;
type UploadSession = { sessionId: string; expiresAt: string };

function hasMeaningfulValues(values: ReportFormValues): boolean {
  const defaults = buildDefaultReportValues() as unknown as Record<string, unknown>;
  return Object.entries(values).some(([key, value]) => {
    if (typeof value === "string") return value.trim().length > 0 && value !== defaults[key];
    return value !== undefined && value !== null && value !== defaults[key];
  });
}

function toPersistedPhoto(photo: PhotoQueueItem): PersistedReportPhoto {
  return {
    id: photo.id,
    fileName: photo.fileName,
    contentType: photo.contentType,
    caption: photo.caption,
    storedFileId: photo.storedFileId,
    uploadSessionId: photo.uploadSessionId,
    takenAt: photo.takenAt,
  };
}

export function useSupervisorReportDraft({
  areaId,
  reportDate,
  form,
  photos,
  restorePhotos,
  requireReselection,
}: {
  areaId: string;
  reportDate: string;
  form: UseFormReturn<ReportFormValues>;
  photos: PhotoQueueItem[];
  restorePhotos: (items: PersistedReportPhoto[]) => void;
  requireReselection: () => void;
}) {
  const draftKey = useMemo(() => supervisorReportDraftKey(areaId, reportDate), [areaId, reportDate]);
  const [step, setStep] = useState<ReportStep>(1);
  const [uploadSession, setUploadSession] = useState<UploadSession | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const draft = readSupervisorReportDraft(draftKey);
      if (draft) {
        form.reset({ ...buildDefaultReportValues(), ...draft.values } as ReportFormValues);
        const expired = draft.uploadSession
          ? Date.parse(draft.uploadSession.expiresAt) <= Date.now()
          : draft.step > 1;
        restorePhotos(draft.photos);
        if (expired) {
          setStep(draft.photos.length ? 2 : 1);
          setUploadSession(null);
          requireReselection();
          if (draft.photos.length) {
            setDraftNotice("Sesi foto sebelumnya kedaluwarsa. Isian dipulihkan; pilih ulang foto yang belum tersedia sebelum melanjutkan.");
          }
        } else {
          const needsReselection = draft.photos.some((photo) => !photo.storedFileId);
          setStep(needsReselection || (draft.step === 3 && !draft.photos.length) ? 2 : draft.step);
          setUploadSession(draft.uploadSession);
          if (needsReselection) {
            setDraftNotice("Berkas foto yang belum terunggah tidak dapat dipulihkan setelah halaman dimuat ulang. Pilih ulang item bertanda gagal; foto yang sudah terunggah tetap tersedia.");
          }
        }
        setDraftRestored(true);
        setDraftSaved(true);
      }
      setDraftReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [form, requireReselection, restorePhotos, draftKey]);

  const persist = useCallback((values: ReportFormValues) => {
    if (!draftReady || completed) return;
    const persistedPhotos = photos.map(toPersistedPhoto);
    const hasWork = hasMeaningfulValues(values) || step > 1 || Boolean(uploadSession) || persistedPhotos.length > 0;
    if (!hasWork) {
      removeSupervisorReportDraft(draftKey);
      setDraftSaved(false);
      setStorageWarning(null);
      return;
    }

    const safeValues = {
      ...values,
      workerCount: Number.isFinite(values.workerCount) ? values.workerCount : undefined,
    };
    const saved = writeSupervisorReportDraft(draftKey, {
      version: 1,
      values: safeValues,
      step,
      uploadSession,
      photos: persistedPhotos,
    });
    setDraftSaved(saved);
    setStorageWarning(saved ? null : "Browser tidak dapat menyimpan isian sementara. Jangan tutup tab sebelum laporan terkirim.");
  }, [completed, draftReady, photos, step, draftKey, uploadSession]);

  useEffect(() => {
    if (!draftReady) return;
    const subscription = form.watch(() => persist(form.getValues()));
    return () => subscription.unsubscribe();
  }, [draftReady, form, persist]);

  useEffect(() => {
    if (!draftReady) return;
    const frame = window.requestAnimationFrame(() => persist(form.getValues()));
    return () => window.cancelAnimationFrame(frame);
  }, [draftReady, form, persist]);

  const clearDraft = useCallback(() => {
    removeSupervisorReportDraft(draftKey);
    setCompleted(true);
    setDraftSaved(false);
    setStorageWarning(null);
  }, [draftKey]);

  return {
    step,
    setStep,
    uploadSession,
    setUploadSession,
    draftReady,
    draftRestored,
    draftSaved,
    draftNotice,
    setDraftNotice,
    storageWarning,
    clearDraft,
  };
}
