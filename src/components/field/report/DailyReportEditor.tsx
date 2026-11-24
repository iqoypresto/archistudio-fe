"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSubmitNewReportMutation } from "@/hooks/report.hooks";
import { usePhotoUploadQueue, buildReportPhotoInputs } from "@/hooks/upload-queue.hooks";
import { useSupervisorReportDraft } from "@/hooks/use-supervisor-report-draft.hooks";
import { reportApi } from "@/lib/api/report.api";
import { recordRecentSupervisorSubmission } from "@/lib/session/supervisor-report-session";
import { cn } from "@/lib/utils";
import { buildDefaultReportValues, buildSubmitReportPayload, reportFormSchema, type ReportFormValues } from "@/lib/validation/report.validation";
import type { SupervisorAreaTaskStatus } from "@/types/api/report-lock.types";
import { NoWorkReportFields } from "./NoWorkReportFields";
import { PhotoUploadQueue } from "./PhotoUploadQueue";
import { ReportSubmitBar, type ReportSubmitState } from "./ReportSubmitBar";
import { ReportReview } from "./ReportReview";
import { ReportStepIndicator } from "./ReportStepIndicator";
import { ReportSuccessOverlay } from "./ReportSuccessOverlay";
import { ReportTypeSwitch } from "./ReportTypeSwitch";
import { WorkReportFields } from "./WorkReportFields";

export function DailyReportEditor({ areaTask, reportDate }: {
  areaTask: SupervisorAreaTaskStatus;
  reportDate: string;
}) {
  const router = useRouter();
  const form = useForm<ReportFormValues>({ resolver: zodResolver(reportFormSchema), defaultValues: buildDefaultReportValues() });
  const reportType = useWatch({ control: form.control, name: "reportType" }) ?? "WORK";
  const photoQueue = usePhotoUploadQueue({ areaId: areaTask.areaId, reportDate });
  const draft = useSupervisorReportDraft({
    areaId: areaTask.areaId,
    reportDate,
    form,
    photos: photoQueue.items,
    restorePhotos: photoQueue.restoreItems,
    requireReselection: photoQueue.requireReselection,
  });
  const submitMutation = useSubmitNewReportMutation();
  const submittingRef = useRef(false);
  const [preparingSession, setPreparingSession] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<ReportSubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ id: string; submittedAt: string | null } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const isBusy = !draft.draftReady || preparingSession || uploadingPhotos || submitState === "submitting" || submitState === "success";

  async function goToPhotoStep(): Promise<void> {
    if (!(await form.trigger())) return;
    setStepError(null);
    if (draft.uploadSession && Date.parse(draft.uploadSession.expiresAt) > Date.now()) {
      draft.setStep(2);
      return;
    }
    if (draft.uploadSession) {
      photoQueue.requireReselection();
      draft.setDraftNotice("Sesi unggah foto kedaluwarsa. Foto yang sudah ada perlu dipilih ulang sebelum laporan dikirim.");
      draft.setUploadSession(null);
    }
    setPreparingSession(true);
    try {
      const session = await reportApi.createUploadSession({ areaId: areaTask.areaId, reportDate });
      draft.setUploadSession(session);
      draft.setStep(2);
    } catch (error) {
      setStepError(error instanceof Error ? error.message : "Gagal menyiapkan unggahan foto. Coba lagi.");
    } finally {
      setPreparingSession(false);
    }
  }

  async function addAndUploadFiles(files: FileList): Promise<void> {
    if (!draft.uploadSession) return;
    setUploadingPhotos(true);
    try {
      const prepared = await photoQueue.addFiles(files);
      if (prepared.length) draft.setDraftNotice(null);
      await photoQueue.uploadItems(prepared.filter((photo) => photo.status !== "failed"), draft.uploadSession.sessionId);
    } finally {
      setUploadingPhotos(false);
    }
  }

  async function retryPhotoUpload(photoId: string): Promise<void> {
    if (!draft.uploadSession) return;
    setUploadingPhotos(true);
    try {
      await photoQueue.retryPhoto(photoId, draft.uploadSession.sessionId);
    } finally {
      setUploadingPhotos(false);
    }
  }

  async function handleValidSubmit(values: ReportFormValues): Promise<void> {
    if (submittingRef.current || submitState === "success") return;
    if (!draft.uploadSession || !photoQueue.submitReadiness.ready) {
      setSubmitState("error");
      setSubmitError(photoQueue.submitReadiness.reason ?? "Sesi unggah foto tidak tersedia. Kembali ke langkah foto dan coba lagi.");
      return;
    }
    submittingRef.current = true;
    setSubmitState("submitting");
    setSubmitError(null);
    try {
      const payload = buildSubmitReportPayload({
        areaId: areaTask.areaId, reportDate, values, photos: buildReportPhotoInputs(photoQueue.items),
      });
      const report = await submitMutation.mutateAsync({ ...payload, sessionId: draft.uploadSession.sessionId });
      recordRecentSupervisorSubmission(report.id);
      draft.clearDraft();
      setSubmitted({ id: report.id, submittedAt: report.submittedAt });
      setSubmitState("success");
      setShowSuccess(true);
    } catch (error) {
      submittingRef.current = false;
      setSubmitState("error");
      setSubmitError(error instanceof Error ? error.message : "Laporan gagal dikirim. Periksa koneksi lalu coba lagi.");
    }
  }

  const canContinueToReview = photoQueue.submitReadiness.ready && !uploadingPhotos;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/field/reports" className={cn(buttonVariants({ variant: "outline" }), "min-h-12 px-3 text-base")}>
          <ArrowLeft className="mr-1.5 size-4" /> Kembali
        </Link>
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-text-primary">{areaTask.projectName} — {areaTask.areaName}</p>
          <p className="font-mono text-sm tabular-nums text-text-secondary">Tanggal Lapor: {reportDate}</p>
        </div>
      </div>

      {draft.draftSaved && <p role="status" className="rounded-xl bg-primary-soft px-3 py-2 text-sm text-text-primary">
        {draft.draftRestored ? "Isian laporan dipulihkan dan disimpan sementara di tab ini." : "Isian laporan disimpan sementara di tab ini."}
      </p>}
      {draft.draftNotice && <p role="status" className="rounded-xl bg-status-warning-bg px-3 py-2 text-sm text-status-warning-fg">{draft.draftNotice}</p>}
      {draft.storageWarning && <p role="alert" className="rounded-xl bg-status-danger-bg px-3 py-2 text-sm text-status-danger-fg">{draft.storageWarning}</p>}

      <ReportStepIndicator step={draft.step} />
      {stepError && <p role="alert" className="rounded-xl bg-status-danger-bg p-3 text-sm font-medium text-status-danger-fg">{stepError}</p>}
      {draft.step === 1 && <ReportTypeSwitch value={reportType} disabled={isBusy} onChange={(type) => form.setValue("reportType", type, { shouldValidate: true })} />}

      {draft.step === 1 && <Card className="border border-border bg-surface">
        <CardContent className="space-y-5 pt-5">
          {reportType === "WORK" ? <WorkReportFields form={form} disabled={isBusy} /> : <NoWorkReportFields form={form} disabled={isBusy} />}
        </CardContent>
      </Card>}

      {draft.step === 2 && <Card className="border border-border bg-surface">
        <CardContent className="space-y-5 pt-5">
          <PhotoUploadQueue
            items={photoQueue.items}
            disabled={uploadingPhotos || isBusy}
            onAddFiles={addAndUploadFiles}
            onRetry={(id) => { void retryPhotoUpload(id); }}
            onCaptionChange={photoQueue.updateCaption}
            onRemove={photoQueue.removePhoto}
          />
        </CardContent>
      </Card>}

      {draft.step === 3 && <ReportReview
        values={form.getValues()}
        projectName={areaTask.projectName}
        areaName={areaTask.areaName}
        reportDate={reportDate}
        photos={photoQueue.items}
        onEdit={draft.setStep}
      />}

      {draft.step === 3 ? (
        <ReportSubmitBar
          state={submitState}
          errorMessage={submitError ?? undefined}
          message={submitState === "submitting" ? "Menyimpan laporan ke server..." : undefined}
          canSubmitPhotos={photoQueue.submitReadiness.ready}
          photoReadinessReason={photoQueue.submitReadiness.reason}
          onConfirmSubmit={() => form.handleSubmit(handleValidSubmit)()}
        />
      ) : (
        <div className="sticky bottom-20 z-20 space-y-2 rounded-2xl border border-border bg-surface p-3 shadow-lg">
          {draft.step === 2 && !canContinueToReview && <p role="status" className="px-1 text-sm text-text-secondary">{photoQueue.submitReadiness.reason}</p>}
          <Button
            type="button"
            className="min-h-12 w-full bg-primary text-base font-semibold text-primary-foreground"
            disabled={isBusy || (draft.step === 2 && !canContinueToReview)}
            onClick={() => void (draft.step === 1 ? goToPhotoStep() : draft.setStep(3))}
          >
            {!draft.draftReady ? "Memulihkan isian..." : preparingSession ? "Menyiapkan unggahan..." : draft.step === 1 ? "Lanjut ke Foto" : "Lanjut ke Konfirmasi"}
          </Button>
          {draft.step === 2 && <Button type="button" variant="outline" className="min-h-12 w-full" disabled={isBusy} onClick={() => draft.setStep(1)}>Kembali ke Keterangan</Button>}
        </div>
      )}

      <ReportSuccessOverlay
        isVisible={showSuccess}
        submittedAt={submitted?.submittedAt ?? null}
        timeZone={areaTask.timezone}
        onClose={() => setShowSuccess(false)}
        onExited={() => { if (submitted) router.replace("/field/reports"); }}
      />
    </div>
  );
}
