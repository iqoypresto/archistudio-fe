"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalFormBackup } from "@/hooks/local-form-backup.hooks";
import { useSaveDraftMutation, useSubmitReportMutation } from "@/hooks/report.hooks";
import { usePhotoUploadQueue } from "@/hooks/upload-queue.hooks";
import { cn } from "@/lib/utils";
import {
  buildDefaultReportValues,
  buildSaveDraftPayload,
  reportFormSchema,
  toUpdateDraftPayload,
  type ReportFormValues,
} from "@/lib/validation/report.validation";
import type { SupervisorAreaTaskStatus } from "@/types/api/report-lock.types";
import type { DailyReportDetail, ReportPhotoInput } from "@/types/api/report.types";
import { NoWorkReportFields } from "./NoWorkReportFields";
import { PhotoUploadQueue } from "./PhotoUploadQueue";
import { ReportSubmitBar } from "./ReportSubmitBar";
import { WorkReportFields } from "./WorkReportFields";

function mapUploadedPhotos(
  items: ReturnType<typeof usePhotoUploadQueue>["items"]
): ReportPhotoInput[] {
  return items
    .filter((item) => item.status === "uploaded" && item.storageKey)
    .map((item, idx) => ({
      storageKey: item.storageKey as string,
      caption: item.caption.trim() || null,
      sortOrder: idx,
      takenAt: item.takenAt,
    }));
}

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
  const { loadBackup, saveBackup, removeBackup } = useLocalFormBackup(
    areaTask.areaId,
    reportDate
  );
  const initialBackup = useMemo(() => (draft ? null : loadBackup()), [draft, loadBackup]);
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: buildDefaultReportValues(draft, initialBackup?.values),
  });
  const photoQueue = usePhotoUploadQueue({
    areaId: areaTask.areaId,
    reportDate,
    initialPhotos: draft?.photos,
  });
  const saveDraftMutation = useSaveDraftMutation();
  const submitMutation = useSubmitReportMutation();
  const watchedValues = useWatch({ control: form.control });
  const reportType = watchedValues.reportType ?? "WORK";
  const uploadedPhotos = useMemo(() => mapUploadedPhotos(photoQueue.items), [photoQueue.items]);

  useEffect(() => {
    saveBackup(watchedValues as Partial<ReportFormValues>, uploadedPhotos);
  }, [saveBackup, uploadedPhotos, watchedValues]);

  async function handleSaveDraft(): Promise<void> {
    const payload = buildSaveDraftPayload({
      areaId: areaTask.areaId,
      reportDate,
      values: form.getValues(),
      photos: uploadedPhotos,
    });
    await saveDraftMutation.mutateAsync({ reportId: draft?.id, payload });
  }

  async function handleValidSubmit(values: ReportFormValues): Promise<void> {
    if (!photoQueue.submitReadiness.ready) {
      toast.error(photoQueue.submitReadiness.reason ?? "Periksa foto laporan.");
      return;
    }
    const savePayload = buildSaveDraftPayload({
      areaId: areaTask.areaId,
      reportDate,
      values,
      photos: uploadedPhotos,
    });
    await submitMutation.mutateAsync({
      reportId: draft?.id,
      savePayload,
      submitPayload: toUpdateDraftPayload(savePayload),
    });
    removeBackup();
    router.replace("/field/tasks");
  }

  const busy = saveDraftMutation.isPending || submitMutation.isPending;

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

      <div className="grid grid-cols-2 gap-2.5">
        {(["WORK", "NO_WORK"] as const).map((type) => (
          <Button
            key={type}
            type="button"
            variant={reportType === type ? "default" : "outline"}
            aria-pressed={reportType === type}
            disabled={busy}
            onClick={() => form.setValue("reportType", type, { shouldValidate: true })}
            className={cn(
              "min-h-12 rounded-xl border px-3 py-2 text-base font-semibold transition-colors",
              reportType === type
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-surface text-text-secondary"
            )}
          >
            {type === "WORK" ? "Ada Pekerjaan" : "Hari Tanpa Pekerjaan"}
          </Button>
        ))}
      </div>

      <Card className="border border-border bg-surface">
        <CardContent className="space-y-5 pt-5">
          <PhotoUploadQueue
            items={photoQueue.items}
            disabled={busy}
            onAddFiles={photoQueue.addFiles}
            onRetry={photoQueue.retryPhoto}
            onCaptionChange={photoQueue.updateCaption}
            onRemove={photoQueue.removePhoto}
          />
          {reportType === "WORK" ? (
            <WorkReportFields form={form} disabled={busy} />
          ) : (
            <NoWorkReportFields form={form} disabled={busy} />
          )}
        </CardContent>
      </Card>

      <ReportSubmitBar
        isSavingDraft={saveDraftMutation.isPending}
        isSubmitting={submitMutation.isPending}
        canSubmitPhotos={photoQueue.submitReadiness.ready}
        photoReadinessReason={photoQueue.submitReadiness.reason}
        onSaveDraft={handleSaveDraft}
        onConfirmSubmit={() => {
          void form.handleSubmit(handleValidSubmit)();
        }}
      />
    </div>
  );
}
