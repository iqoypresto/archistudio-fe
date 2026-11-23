"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export type ReportSubmitState = "idle" | "submitting" | "success" | "error";

export function ReportSubmitBar({
  state,
  message,
  errorMessage,
  canSubmitPhotos,
  photoReadinessReason,
  onConfirmSubmit,
}: {
  state: ReportSubmitState;
  message?: string;
  errorMessage?: string;
  canSubmitPhotos: boolean;
  photoReadinessReason?: string;
  onConfirmSubmit: () => Promise<void> | void;
}) {
  const reduceMotion = useReducedMotion();
  const isDisabled = state === "submitting" || state === "success" || !canSubmitPhotos;
  const buttonText = state === "error" ? "Coba kirim lagi" : "Kirim Laporan";

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-xs">
      {!canSubmitPhotos && photoReadinessReason && (
        <p className="text-sm text-status-warning-fg">{photoReadinessReason}</p>
      )}
      {errorMessage && <p role="alert" className="rounded-xl bg-status-danger-bg p-3 text-sm font-medium text-status-danger-fg">{errorMessage}</p>}
      {message && <p role="status" className="text-sm font-semibold text-text-secondary">{message}</p>}
      <motion.button
        type="button"
        aria-label={state === "submitting" ? "Mengirim laporan" : buttonText}
        disabled={isDisabled}
        onClick={() => void onConfirmSubmit()}
        animate={state === "submitting"
          ? { scaleX: 0.92, opacity: 1, x: 0 }
          : state === "success"
            ? { opacity: 0, scale: 0.98, x: 0 }
            : state === "error" && !reduceMotion
              ? { scaleX: 1, opacity: 1, x: [0, -5, 5, -4, 4, 0] }
              : { scaleX: 1, opacity: 1, x: 0 }}
        transition={reduceMotion ? { duration: 0.12 } : { duration: state === "error" ? 0.32 : 0.22, ease: "easeOut" }}
        className="flex min-h-14 w-full items-center justify-center rounded-xl bg-primary px-4 text-base font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "submitting"
          ? <Loader2 className="size-5 animate-spin motion-reduce:animate-none" />
          : <><CheckCircle2 className="mr-2 size-5" />{buttonText}</>}
      </motion.button>
    </div>
  );
}
