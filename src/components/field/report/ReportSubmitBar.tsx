"use client";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportSubmitBar({ isSubmitting, progressLabel, canSubmitPhotos,
  photoReadinessReason, onConfirmSubmit }: {
  isSubmitting: boolean;
  progressLabel: string;
  canSubmitPhotos: boolean;
  photoReadinessReason?: string;
  onConfirmSubmit: () => Promise<void> | void;
}) {
  return <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-xs">
    {!canSubmitPhotos && photoReadinessReason &&
      <p className="text-sm text-status-warning-fg">{photoReadinessReason}</p>}
    <p className="text-sm text-text-secondary">Foto baru diunggah setelah Anda menekan Kirim Laporan.</p>
    {isSubmitting && <p role="status" className="text-sm font-semibold text-primary">{progressLabel}</p>}
    <Button type="button" disabled={isSubmitting || !canSubmitPhotos}
      onClick={() => void onConfirmSubmit()}
      className="min-h-14 w-full bg-primary text-base font-bold text-primary-foreground">
      {isSubmitting ? <Loader2 className="mr-2 size-5 animate-spin" />
        : <CheckCircle2 className="mr-2 size-5" />}
      {isSubmitting ? "Mengirim laporan..." : "Kirim Laporan"}
    </Button>
  </div>;
}
