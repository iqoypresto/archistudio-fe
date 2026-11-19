"use client";

import { CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportSubmitBar({
  isSavingDraft,
  isSubmitting,
  canSubmitPhotos,
  photoReadinessReason,
  onSaveDraft,
  onConfirmSubmit,
}: {
  isSavingDraft: boolean;
  isSubmitting: boolean;
  canSubmitPhotos: boolean;
  photoReadinessReason?: string;
  onSaveDraft: () => void;
  onConfirmSubmit: () => Promise<void> | void;
}) {
  const busy = isSavingDraft || isSubmitting;

  return (
    <div className="space-y-2 rounded-xl border border-border bg-surface p-4 shadow-xs">
      {!canSubmitPhotos && photoReadinessReason && (
        <p className="text-sm font-medium text-status-warning-fg">
          {photoReadinessReason}
        </p>
      )}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onSaveDraft}
          className="min-h-12 text-base font-semibold"
        >
          {isSavingDraft ? (
            <Loader2 className="mr-2 size-5 animate-spin" />
          ) : (
            <Save className="mr-2 size-5" />
          )}
          Simpan Draf
        </Button>
        <Button
          type="button"
          disabled={busy}
          onClick={() => void onConfirmSubmit()}
          className="min-h-12 bg-primary text-base font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 size-5 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 size-5" />
          )}
          Kirim & Paraf Otomatis
        </Button>
      </div>
    </div>
  );
}
