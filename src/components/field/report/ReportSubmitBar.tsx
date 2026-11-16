"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ReportSubmitBar({
  isSavingDraft,
  isSubmitting,
  isPastCutoff,
  canSubmitPhotos,
  photoReadinessReason,
  onSaveDraft,
  onConfirmSubmit,
}: {
  isSavingDraft: boolean;
  isSubmitting: boolean;
  isPastCutoff: boolean;
  canSubmitPhotos: boolean;
  photoReadinessReason?: string;
  onSaveDraft: () => void;
  onConfirmSubmit: () => Promise<void> | void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const busy = isSavingDraft || isSubmitting;

  function handlePrimaryClick() {
    if (isPastCutoff) {
      setConfirmOpen(true);
      return;
    }
    void onConfirmSubmit();
  }

  return (
    <>
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
            onClick={handlePrimaryClick}
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-status-warning-fg">
              <AlertTriangle className="size-5 shrink-0" />
              Melewati Batas Jam 17:00
            </DialogTitle>
            <DialogDescription className="text-base text-text-primary">
              Melewati jam 17:00 waktu project, laporan akan ditandai{" "}
              <strong>Terlambat</strong>. Tetap kirim sekarang?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="min-h-12 text-base"
            >
              Periksa Lagi
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={async () => {
                setConfirmOpen(false);
                await onConfirmSubmit();
              }}
              className="min-h-12 bg-primary text-base font-semibold text-primary-foreground"
            >
              Tetap Kirim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
