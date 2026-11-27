"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ReportUploadExitDialog({
  open,
  canCancelUpload,
  cancelling,
  error,
  onOpenChange,
  onStay,
  onCancelUpload,
}: {
  open: boolean;
  canCancelUpload: boolean;
  cancelling: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onStay: () => void;
  onCancelUpload: () => void;
}) {
  return <Dialog open={open} onOpenChange={(next) => { if (!cancelling) onOpenChange(next); }}>
    <DialogContent
      role="alertdialog"
      aria-labelledby="upload-exit-title"
      aria-describedby="upload-exit-description"
      showCloseButton={false}
      className="z-[95] gap-4 border border-border bg-surface text-text-primary"
    >
      <DialogHeader>
        <DialogTitle id="upload-exit-title">{canCancelUpload ? "Batalkan unggahan dan keluar?" : "Laporan sedang disimpan"}</DialogTitle>
        <DialogDescription id="upload-exit-description">
          {canCancelUpload
            ? "Foto yang sudah sempat terunggah akan dijadwalkan untuk dihapus. Anda perlu memilih dan mengirim ulang foto jika membuat laporan lagi."
            : "Permintaan penyimpanan sudah dimulai. Tetap di halaman sampai server memastikan hasil pengiriman."}
        </DialogDescription>
      </DialogHeader>
      {error && <p role="alert" className="rounded-lg bg-status-danger-bg p-3 text-sm text-status-danger-fg">{error}</p>}
      <DialogFooter className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" disabled={cancelling} onClick={onStay} className="min-w-0">
          Tetap di sini
        </Button>
        {canCancelUpload && <Button type="button" disabled={cancelling} onClick={onCancelUpload} className="min-w-0">
          {cancelling ? "Membatalkan…" : "Batalkan upload & keluar"}
        </Button>}
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
