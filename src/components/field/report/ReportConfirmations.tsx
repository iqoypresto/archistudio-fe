"use client";

import { CheckCircle2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function FinalSubmitDialog({ open, onOpenChange, onConfirm, busy, projectName, areaName, reportDate, reportType, photoCount, late }: {
  open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; busy: boolean;
  projectName: string; areaName: string; reportDate: string; reportType: "WORK" | "NO_WORK"; photoCount: number; late: boolean;
}) {
  const StatusIcon = late ? TriangleAlert : CheckCircle2;
  return <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
    <DialogContent role="alertdialog" aria-labelledby="final-submit-title" aria-describedby="final-submit-description" showCloseButton={false} className="max-h-[calc(100dvh-2rem)] overflow-y-auto gap-4 border border-[#e8d9cf] bg-[#fffaf7] text-[#1d1c1b]">
      <DialogHeader>
        <DialogTitle id="final-submit-title" className="text-lg font-bold text-[#1d1c1b]">Kirim laporan ini sekarang?</DialogTitle>
        <DialogDescription id="final-submit-description" className="text-[#64564d]">Foto akan diunggah dan laporan akan disimpan. Setelah terkirim, laporan tercatat untuk tanggal ini.</DialogDescription>
      </DialogHeader>
      <dl className="space-y-2 rounded-xl border border-[#e8d9cf] bg-white px-3 py-3 text-sm">
        <div><dt className="text-xs text-[#64564d]">Proyek</dt><dd className="break-words font-semibold">{projectName}</dd></div>
        <div><dt className="text-xs text-[#64564d]">Area dan tanggal</dt><dd className="break-words font-semibold">{areaName} · {reportDate}</dd></div>
        <div><dt className="text-xs text-[#64564d]">Isi laporan</dt><dd className="font-semibold">{reportType === "WORK" ? "Ada Pekerjaan" : "Tidak Ada Pekerjaan"} · {photoCount} foto</dd></div>
      </dl>
      <div role={late ? "note" : "status"} className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${late ? "border-[#e4bd57] bg-[#fff2c6] text-[#583500]" : "border-[#9ac7a2] bg-[#edf7ee] text-[#174b28]"}`}>
        <StatusIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>{late
          ? "Batas waktu pukul 17.00 sudah terlewati. Laporan ini akan dicatat terlambat."
          : "Batas pukul 17.00 belum terlewati. Status akhir mengikuti waktu yang dicatat server."}</p>
      </div>
      <DialogFooter className="grid grid-cols-2 gap-2 border-[#e8d9cf] bg-[#f7f3ef]">
        <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)} className="min-h-12 min-w-0 w-full whitespace-nowrap border-[#d8c3b6] bg-white px-2 text-sm text-[#75442d] hover:bg-[#f7eee8]">Batal</Button>
        <Button type="button" disabled={busy} className="min-h-12 min-w-0 w-full whitespace-nowrap bg-[#9c471d] px-2 text-sm text-white hover:bg-[#823b19]" onClick={onConfirm}>Kirim laporan</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
