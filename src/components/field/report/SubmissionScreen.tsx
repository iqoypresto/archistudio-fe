"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SubmissionStatus = "uploading" | "saving" | "failed" | "unknown";

export function SubmissionScreen({ status, message, retryAllowed, onRetry, onCheck, progress }: {
  status: SubmissionStatus | null; message?: string | null; retryAllowed: boolean; progress?: number;
  onRetry: () => void; onCheck: () => void;
}) {
  const reduced = useReducedMotion();
  return <AnimatePresence>
    {status && <motion.section key={status} role="dialog" aria-modal="true" aria-labelledby="submission-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0.1 : 0.2 }} className="fixed inset-0 z-[75] flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-8 text-center">
      {status === "uploading" ? <Loader2 aria-hidden="true" className="size-12 animate-spin text-primary motion-reduce:animate-none" /> : status === "saving" ? <CheckCircle2 aria-hidden="true" className="size-12 text-primary" /> : <TriangleAlert aria-hidden="true" className="size-12 text-status-warning-fg" />}
      <h1 id="submission-title" className="mt-5 text-xl font-bold text-text-primary">{status === "uploading" ? "Mengunggah foto…" : status === "saving" ? "Menyimpan laporan…" : status === "unknown" ? "Status pengiriman belum dapat dipastikan" : "Laporan belum berhasil dikirim"}</h1>
      <p role="status" className="mt-2 max-w-sm text-sm text-text-secondary">{message ?? (status === "uploading" ? `Foto sedang dikirim dengan aman.${typeof progress === "number" ? ` ${progress}%` : ""}` : status === "saving" ? "Foto selesai diunggah. Menunggu konfirmasi server." : "Periksa koneksi, lalu periksa status laporan.")}</p>
      {(status === "failed" || status === "unknown") && <div className="mt-6 grid w-full max-w-sm gap-2">
        {retryAllowed && <Button type="button" onClick={onRetry} className="min-h-12 bg-primary text-primary-foreground">Coba kirim lagi</Button>}
        <Button type="button" variant="outline" onClick={onCheck} className="min-h-12">Periksa status laporan</Button>
      </div>}
    </motion.section>}
  </AnimatePresence>;
}
