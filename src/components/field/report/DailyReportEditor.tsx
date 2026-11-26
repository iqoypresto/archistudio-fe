"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { defineStepper } from "@stepperize/react/headless";
import { useForm, useWatch } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { useSubmitNewReportMutation } from "@/hooks/report.hooks";
import { usePhotoUploadQueue, buildReportPhotoInputs } from "@/hooks/upload-queue.hooks";
import { useSupervisorReportDraft } from "@/hooks/use-supervisor-report-draft.hooks";
import { useAuthStore } from "@/stores/auth.store";
import { reportApi } from "@/lib/api/report.api";
import { ApiError } from "@/lib/api/api-error";
import { recordRecentSupervisorSubmission } from "@/lib/session/supervisor-report-session";
import { buildDefaultReportValues, buildSubmitReportPayload, isPastProjectCutoff1700, reportFormSchema, type ReportFormValues } from "@/lib/validation/report.validation";
import type { SupervisorAreaTaskStatus } from "@/types/api/report-lock.types";
import { NoWorkReportFields } from "./NoWorkReportFields";
import { PhotoUploadQueue } from "./PhotoUploadQueue";
import { ReportReview } from "./ReportReview";
import { ReportContextCard, formatReportDate } from "./NewReportInformation";
import { ReportStepIndicator } from "./ReportStepIndicator";
import { ReportSuccessOverlay } from "./ReportSuccessOverlay";
import { ReportTypeSwitch } from "./ReportTypeSwitch";
import { WorkReportFields } from "./WorkReportFields";
import { ContextReviewDrawer, FinalSubmitDialog } from "./ReportConfirmations";
import { ReportFooter } from "./ReportFooter";
import { SubmissionScreen, type SubmissionStatus } from "./SubmissionScreen";

const flow = defineStepper([{ id: "details", title: "Keterangan" }, { id: "photos", title: "Foto" }, { id: "confirmation", title: "Konfirmasi" }]);
const STEP_IDS = ["details", "photos", "confirmation"] as const;
const isReadyLocally = (items: Array<{ status: string }>) => items.length > 0 && items.length <= 10 && items.every((item) => item.status === "local" || item.status === "uploaded");

export function DailyReportEditor({ areaTask, reportDate }: { areaTask: SupervisorAreaTaskStatus; reportDate: string }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const form = useForm<ReportFormValues>({ resolver: zodResolver(reportFormSchema), defaultValues: buildDefaultReportValues() });
  const reportType = useWatch({ control: form.control, name: "reportType" }) ?? "WORK";
  const photoQueue = usePhotoUploadQueue({ areaId: areaTask.areaId, reportDate });
  const draft = useSupervisorReportDraft({ areaId: areaTask.areaId, reportDate, form, photos: photoQueue.items, restorePhotos: photoQueue.restoreItems, requireReselection: photoQueue.requireReselection });
  const stepper = flow.useStepper({ step: STEP_IDS[draft.step - 1], linear: true, onStepChange: (id) => draft.setStep((STEP_IDS.indexOf(id as typeof STEP_IDS[number]) + 1) as 1 | 2 | 3) });
  const submitMutation = useSubmitNewReportMutation();
  const sending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [confirmContext, setConfirmContext] = useState(false);
  const [confirmFinal, setConfirmFinal] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [retryAllowed, setRetryAllowed] = useState(true);
  const [submitted, setSubmitted] = useState<{ id: string; at: string | null } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const late = useMemo(() => isPastProjectCutoff1700(new Date(), reportDate, areaTask.timezone), [areaTask.timezone, reportDate]);
  const isBusy = !draft.draftReady || busy || stepper.isPending || submitMutation.isPending;

  async function advance(): Promise<void> {
    setStepError(null);
    if (draft.step === 1) {
      if (!(await form.trigger())) return;
      await stepper.next({ data: form.getValues(), complete: true });
      return;
    }
    if (draft.step === 2) {
      if (!isReadyLocally(photoQueue.items)) { setStepError(photoQueue.items.some((photo) => photo.status === "failed") ? "Hapus foto yang gagal disiapkan lalu pilih ulang." : "Pilih minimal 1 dan maksimal 10 foto sebelum melanjutkan."); return; }
      await stepper.next({ data: photoQueue.items.map(({ id, fileName, caption }) => ({ id, fileName, caption })), complete: true });
      return;
    }
    setConfirmContext(true);
  }

  async function checkAfterUnknown(): Promise<boolean> {
    setSubmissionStatus("unknown"); setRetryAllowed(false);
    try {
      const result = await reportApi.listReports({ areaId: areaTask.areaId, reportDate, scope: "own", page: 1, pageSize: 1 }, "field");
      const report = result.data[0];
      if (report) { recordRecentSupervisorSubmission(report.id); draft.clearDraft(); setSubmitted({ id: report.id, at: report.submittedAt }); setSubmissionStatus(null); setShowSuccess(true); return true; }
      setSubmissionStatus("failed"); setSubmissionMessage("Laporan belum ditemukan. Pengiriman dapat dicoba kembali."); setRetryAllowed(true); return false;
    } catch {
      setSubmissionStatus("unknown"); setSubmissionMessage("Belum bisa memastikan apakah server menerima laporan. Periksa status lagi sebelum mencoba ulang."); setRetryAllowed(false); return false;
    }
  }

  async function sendReport(): Promise<void> {
    if (sending.current) return;
    sending.current = true; stepper.setComplete("confirmation"); setBusy(true); setConfirmFinal(false); setSubmissionStatus("uploading"); setSubmissionMessage(null);
    let reportRequestStarted = false;
    try {
      let session = draft.uploadSession;
      if (!session || Date.parse(session.expiresAt) <= Date.now()) {
        session = await reportApi.createUploadSession({ areaId: areaTask.areaId, reportDate }); draft.setUploadSession(session);
      }
      const uploaded = await photoQueue.uploadItems(photoQueue.items, session.sessionId);
      if (!uploaded) throw new Error("Sebagian foto gagal diunggah. Periksa foto yang gagal lalu coba lagi.");
      setSubmissionStatus("saving");
      const values = form.getValues();
      const payload = buildSubmitReportPayload({ areaId: areaTask.areaId, reportDate, values, photos: buildReportPhotoInputs(photoQueue.items) });
      reportRequestStarted = true;
      const report = await submitMutation.mutateAsync({ ...payload, sessionId: session.sessionId });
      recordRecentSupervisorSubmission(report.id); draft.clearDraft(); setSubmitted({ id: report.id, at: report.submittedAt }); setSubmissionStatus(null); setShowSuccess(true);
    } catch (error) {
      if (reportRequestStarted && error instanceof ApiError && (error.code === "NETWORK_ERROR" || error.statusCode >= 500)) { setSubmissionStatus("unknown"); setRetryAllowed(false); setSubmissionMessage("Respons server belum memastikan apakah laporan sudah diterima. Kami sedang memeriksa status laporan."); await checkAfterUnknown(); }
      else { setSubmissionStatus("failed"); setSubmissionMessage(error instanceof Error ? error.message : "Laporan belum berhasil dikirim."); setRetryAllowed(true); }
    } finally { sending.current = false; setBusy(false); }
  }

  function onContextContinue(): void { setConfirmContext(false); window.setTimeout(() => setConfirmFinal(true), 180); }
  const transferStarted = photoQueue.items.some((photo) => photo.status === "uploading" && photo.progress > 0);
  const uploadProgress = transferStarted ? Math.round(photoQueue.items.reduce((sum, photo) => sum + (photo.status === "uploaded" ? 100 : photo.status === "uploading" ? photo.progress : 0), 0) / photoQueue.items.length) : undefined;

  return <div className="report-form-theme space-y-4">
    <ReportContextCard projectName={areaTask.projectName} areaName={areaTask.areaName} reportDate={reportDate} />
    {draft.draftNotice && <p role="status" className="rounded-xl bg-status-warning-bg px-3 py-2 text-sm text-status-warning-fg">{draft.draftNotice}</p>}
    {draft.storageWarning && <p role="alert" className="rounded-xl bg-status-danger-bg px-3 py-2 text-sm text-status-danger-fg">{draft.storageWarning}</p>}
    <ReportStepIndicator step={draft.step} />
    {stepError && <p role="alert" className="rounded-xl bg-status-danger-bg p-3 text-sm font-medium text-status-danger-fg">{stepError}</p>}
    {draft.step === 1 && <><ReportTypeSwitch value={reportType} disabled={isBusy} onChange={(type) => form.setValue("reportType", type, { shouldValidate: true })} /><Card className="border border-border bg-surface"><CardContent className="space-y-5 pt-5">{reportType === "WORK" ? <WorkReportFields form={form} disabled={isBusy} /> : <NoWorkReportFields form={form} disabled={isBusy} />}</CardContent></Card></>}
    {draft.step === 2 && <Card className="border border-border bg-surface"><CardContent className="pt-5"><PhotoUploadQueue items={photoQueue.items} disabled={isBusy} onAddFiles={photoQueue.addFiles} onRetry={(id) => { void photoQueue.retryPhoto(id); }} onCaptionChange={photoQueue.updateCaption} onRemove={photoQueue.removePhoto} /></CardContent></Card>}
    {draft.step === 3 && <ReportReview values={form.getValues()} photos={photoQueue.items} signerName={user?.name ?? "Supervisor"} signerTitle={user?.jobTitle ?? "Supervisor Lapangan"} late={late} onEdit={(step) => { void stepper.goTo(STEP_IDS[step - 1]); }} />}
    <ReportFooter step={draft.step} disabled={isBusy} onBack={() => { void stepper.prev(); }} onNext={() => void advance()} />
    <ContextReviewDrawer open={confirmContext} onOpenChange={setConfirmContext} projectName={areaTask.projectName} areaName={areaTask.areaName} reportDate={formatReportDate(reportDate)} values={form.getValues()} photoCount={photoQueue.items.length} late={late} onContinue={onContextContinue} />
    <FinalSubmitDialog open={confirmFinal} onOpenChange={setConfirmFinal} onConfirm={() => void sendReport()} busy={isBusy} />
    <SubmissionScreen status={submissionStatus} message={submissionMessage} retryAllowed={retryAllowed} onRetry={() => void sendReport()} onCheck={() => void checkAfterUnknown()} progress={uploadProgress} />
    <ReportSuccessOverlay isVisible={showSuccess} submittedAt={submitted?.at ?? null} timeZone={areaTask.timezone} onClose={() => setShowSuccess(false)} onExited={() => { if (submitted) router.replace("/field/reports"); }} />
  </div>;
}
