"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSubmitNewReportMutation, useSubmitReportMutation } from "@/hooks/report.hooks";
import { usePhotoUploadQueue } from "@/hooks/upload-queue.hooks";
import { localReportKey, readLocalReport, removeLocalReport, writeLocalReport } from "@/lib/storage/local-report";
import { reportApi } from "@/lib/api/report.api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import {
  buildDefaultReportValues,
  buildSaveDraftPayload,
  reportFormSchema,
  toUpdateDraftPayload,
  type ReportFormValues,
} from "@/lib/validation/report.validation";
import type { SupervisorAreaTaskStatus } from "@/types/api/report-lock.types";
import type { DailyReportDetail } from "@/types/api/report.types";
import { NoWorkReportFields } from "./NoWorkReportFields";
import { PhotoUploadQueue } from "./PhotoUploadQueue";
import { ReportSubmitBar } from "./ReportSubmitBar";
import { ReportReview } from "./ReportReview";
import { ReportStepIndicator } from "./ReportStepIndicator";
import { ReportTypeSwitch } from "./ReportTypeSwitch";
import { WorkReportFields } from "./WorkReportFields";
export function DailyReportEditor({
  areaTask,
  reportDate,
  draft,
}: {
  areaTask: SupervisorAreaTaskStatus;
  reportDate: string;
  draft?: DailyReportDetail;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendStage, setSendStage] = useState("");
  const [saveState, setSaveState] = useState("Memuat penyimpanan perangkat...");
  const pendingSave = useRef<Promise<unknown> | null>(null);
  const submittedRef = useRef(false);
  const userId = useAuthStore((state) => state.user?.id);
  const cacheKey = localReportKey(userId ?? "", areaTask.areaId, reportDate);
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: buildDefaultReportValues(draft),
  });
  const photoQueue = usePhotoUploadQueue({
    areaId: areaTask.areaId,
    reportDate,
    initialPhotos: draft?.photos,
  });
  const submitMutation = useSubmitReportMutation();
  const submitNewMutation = useSubmitNewReportMutation();
  const watchedValues = useWatch({ control: form.control });
  const reportType = watchedValues.reportType ?? "WORK";
  useEffect(() => {
    if (!userId) return;
    let active = true;
    void readLocalReport(cacheKey).then((saved) => {
      if (!active) return;
      if (saved && !draft) {
        form.reset(buildDefaultReportValues(undefined, saved.values));
        photoQueue.restoreItems(saved.photos);
      }
      setReady(true);
      setSaveState("Tersimpan sementara di perangkat ini");
    }).catch(() => {
      if (active) { setReady(true); setSaveState("Penyimpanan perangkat tidak tersedia"); }
    });
    return () => { active = false; };
  // Pemulihan dijalankan sekali untuk identitas dan tanggal laporan ini.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, userId]);
  useEffect(() => {
    if (!ready || !userId || draft) return;
    const timer = window.setTimeout(() => {
      if (submittedRef.current) return;
      setSaveState("Menyimpan di perangkat...");
      pendingSave.current = writeLocalReport(cacheKey, {
        values: watchedValues as Partial<ReportFormValues>,
        photos: photoQueue.localPhotos, savedAt: new Date().toISOString(),
      }).then(() => setSaveState("Tersimpan sementara di perangkat ini"))
        .catch(() => setSaveState("Gagal menyimpan di perangkat"));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [cacheKey, draft, photoQueue.localPhotos, ready, userId, watchedValues]);
  async function handleValidSubmit(values: ReportFormValues): Promise<void> {
    if (!photoQueue.submitReadiness.ready) {
      toast.error(photoQueue.submitReadiness.reason ?? "Periksa foto laporan.");
      return;
    }
    setSending(true);
    try {
      setSendStage("Mengunggah foto...");
      const session = await reportApi.createUploadSession({ areaId: areaTask.areaId, reportDate, reportId: draft?.id });
      const photos = await photoQueue.uploadAll(session.sessionId);
      const payload = { ...buildSaveDraftPayload({ areaId: areaTask.areaId, reportDate, values, photos }), sessionId: session.sessionId };
      setSendStage("Mengirim laporan...");
      const submitted = draft
        ? await submitMutation.mutateAsync({ reportId: draft.id, submitPayload: { ...toUpdateDraftPayload(payload), sessionId: session.sessionId } })
        : await submitNewMutation.mutateAsync(payload);
      submittedRef.current = true;
      setReady(false);
      await pendingSave.current?.catch(() => undefined);
      if (userId) await removeLocalReport(cacheKey).catch(() => undefined);
      router.replace(`/field/reports/${submitted.id}/success`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengirim. Coba lagi.");
    } finally { setSending(false); setSendStage(""); }
  }

  async function goToPhoto(): Promise<void> {
    if (await form.trigger()) setStep(2);
  }
  function goToReview(): void {
    if (!photoQueue.submitReadiness.ready) {
      toast.error(photoQueue.submitReadiness.reason ?? "Periksa foto laporan.");
      return;
    }
    setStep(3);
  }
  const busy = sending;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/field/tasks"
          className={cn(buttonVariants({ variant: "outline" }), "min-h-12 px-3 text-base")}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Kembali
        </Link>
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-text-primary">
            {areaTask.projectName} — {areaTask.areaName}
          </p>
          <p className="font-mono text-sm tabular-nums text-text-secondary">
            Tanggal Lapor: {reportDate}
          </p>
        </div>
      </div>

      <ReportStepIndicator step={step} />
      {!draft && <p role="status" className="text-sm text-text-secondary">Belum dikirim · {saveState}</p>}

      {step === 1 && <ReportTypeSwitch value={reportType} disabled={busy}
        onChange={(type) => form.setValue("reportType", type, { shouldValidate: true })} />}

      {step !== 3 ? <Card className="border border-border bg-surface">
        <CardContent className="space-y-5 pt-5">
          {step === 2 ? <PhotoUploadQueue
            items={photoQueue.items}
            disabled={busy}
            onAddFiles={photoQueue.addFiles}
            onRetry={photoQueue.retryPhoto}
            onCaptionChange={photoQueue.updateCaption}
            onRemove={photoQueue.removePhoto}
          /> : reportType === "WORK" ? (
            <WorkReportFields form={form} disabled={busy} />
          ) : (
            <NoWorkReportFields form={form} disabled={busy} />
          )}
        </CardContent>
      </Card> : <ReportReview
        values={form.getValues()}
        projectName={areaTask.projectName}
        areaName={areaTask.areaName}
        reportDate={reportDate}
        photoCount={photoQueue.items.length}
        onEdit={setStep}
      />}

      {step === 3 ? <ReportSubmitBar
        isSubmitting={sending}
        progressLabel={sendStage}
        canSubmitPhotos={photoQueue.submitReadiness.ready}
        photoReadinessReason={photoQueue.submitReadiness.reason}
        onConfirmSubmit={() => {
          void form.handleSubmit(handleValidSubmit)();
        }}
      /> : <div className="sticky bottom-20 z-20 space-y-2 rounded-2xl border border-border bg-surface p-3 shadow-lg">
        <Button type="button" className="min-h-12 w-full bg-primary text-base font-semibold text-primary-foreground" disabled={busy}
          onClick={() => void (step === 1 ? goToPhoto() : goToReview())}>
          {step === 1 ? "Lanjut ke Foto" : "Lanjut ke Periksa"}
        </Button>
        {step === 2 && <Button type="button" variant="outline" className="min-h-12 w-full" onClick={() => setStep(1)}>Kembali ke Kondisi</Button>}
      </div>}
    </div>
  );
}
