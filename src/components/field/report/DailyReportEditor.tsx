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
import { reportApi } from "@/lib/api/report.api";
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
  const submitMutation = useSubmitNewReportMutation();
  const submittingRef = useRef(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [uploadSessionId, setUploadSessionId] = useState<string | null>(null);
  const [preparingSession, setPreparingSession] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<ReportSubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ id: string; submittedAt: string | null } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const isBusy = preparingSession || uploadingPhotos || submitState === "submitting" || submitState === "success";

  async function goToPhotoStep(): Promise<void> {
    if (!(await form.trigger())) return;
    setStepError(null);
    if (uploadSessionId) { setStep(2); return; }
    setPreparingSession(true);
    try {
      const session = await reportApi.createUploadSession({ areaId: areaTask.areaId, reportDate });
      setUploadSessionId(session.sessionId);
      setStep(2);
    } catch (error) {
      setStepError(error instanceof Error ? error.message : "Gagal menyiapkan unggahan foto. Coba lagi.");
    } finally {
      setPreparingSession(false);
    }
  }

  async function addAndUploadFiles(files: FileList): Promise<void> {
    if (!uploadSessionId) return;
    setUploadingPhotos(true);
    try {
      const prepared = await photoQueue.addFiles(files);
      await photoQueue.uploadItems(prepared.filter((photo) => photo.status !== "failed"), uploadSessionId);
    } finally {
      setUploadingPhotos(false);
    }
  }

  async function retryPhotoUpload(photoId: string): Promise<void> {
    if (!uploadSessionId) return;
    setUploadingPhotos(true);
    try {
      await photoQueue.retryPhoto(photoId, uploadSessionId);
    } finally {
      setUploadingPhotos(false);
    }
  }

  async function handleValidSubmit(values: ReportFormValues): Promise<void> {
    if (submittingRef.current || submitState === "success") return;
    if (!uploadSessionId || !photoQueue.submitReadiness.ready) {
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
      const report = await submitMutation.mutateAsync({ ...payload, sessionId: uploadSessionId });
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

      <ReportStepIndicator step={step} />
      {stepError && <p role="alert" className="rounded-xl bg-status-danger-bg p-3 text-sm font-medium text-status-danger-fg">{stepError}</p>}
      {step === 1 && <ReportTypeSwitch value={reportType} disabled={isBusy} onChange={(type) => form.setValue("reportType", type, { shouldValidate: true })} />}

      {step === 1 && <Card className="border border-border bg-surface">
        <CardContent className="space-y-5 pt-5">
          {reportType === "WORK" ? <WorkReportFields form={form} disabled={isBusy} /> : <NoWorkReportFields form={form} disabled={isBusy} />}
        </CardContent>
      </Card>}

      {step === 2 && <Card className="border border-border bg-surface">
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

      {step === 3 && <ReportReview
        values={form.getValues()}
        projectName={areaTask.projectName}
        areaName={areaTask.areaName}
        reportDate={reportDate}
        photos={photoQueue.items}
        onEdit={setStep}
      />}

      {step === 3 ? (
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
          {step === 2 && !canContinueToReview && <p role="status" className="px-1 text-sm text-text-secondary">{photoQueue.submitReadiness.reason}</p>}
          <Button
            type="button"
            className="min-h-12 w-full bg-primary text-base font-semibold text-primary-foreground"
            disabled={isBusy || (step === 2 && !canContinueToReview)}
            onClick={() => void (step === 1 ? goToPhotoStep() : setStep(3))}
          >
            {preparingSession ? "Menyiapkan unggahan..." : step === 1 ? "Lanjut ke Foto" : "Lanjut ke Konfirmasi"}
          </Button>
          {step === 2 && <Button type="button" variant="outline" className="min-h-12 w-full" disabled={isBusy} onClick={() => setStep(1)}>Kembali ke Keterangan</Button>}
        </div>
      )}

      <ReportSuccessOverlay
        isVisible={showSuccess}
        submittedAt={submitted?.submittedAt ?? null}
        timeZone={areaTask.timezone}
        onClose={() => setShowSuccess(false)}
        onExited={() => { if (submitted) router.replace(`/field/reports?submittedId=${submitted.id}`); }}
      />
    </div>
  );
}
