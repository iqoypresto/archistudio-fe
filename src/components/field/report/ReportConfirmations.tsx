"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ReportFormValues } from "@/lib/validation/report.validation";

export function ContextReviewDrawer({ open, onOpenChange, projectName, areaName, reportDate, values, photoCount, late, onContinue }: {
  open: boolean; onOpenChange: (open: boolean) => void; projectName: string; areaName: string;
  reportDate: string; values: ReportFormValues; photoCount: number; late: boolean; onContinue: () => void;
}) {
  const lines = [
    ["Proyek", projectName], ["Area", areaName], ["Tanggal", reportDate],
    ["Jenis laporan", values.reportType === "WORK" ? "Ada Pekerjaan" : "Tidak Ada Pekerjaan"], ["Jumlah foto", `${photoCount} foto`],
  ];
  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="bottom" showCloseButton closeButtonClassName="text-[#6d5548] hover:bg-[#f7eee8]" className="max-h-[85dvh] rounded-t-3xl border-[#e8d9cf] bg-[#fffaf7] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-[#1d1c1b]">
      <SheetHeader className="px-0">
        <SheetTitle className="text-lg font-bold text-[#1d1c1b]">Periksa konteks laporan</SheetTitle>
        <SheetDescription className="text-[#64564d]">Pastikan laporan ini dikirim untuk proyek, area, dan tanggal yang benar.</SheetDescription>
      </SheetHeader>
      <dl className="divide-y divide-border rounded-xl border border-border">
        {lines.map(([label, value]) => <div key={label} className="grid grid-cols-[7rem_1fr] gap-3 px-3 py-2.5 text-sm"><dt className="text-text-secondary">{label}</dt><dd className="font-semibold text-text-primary">{value}</dd></div>)}
      </dl>
      {late && <p className="flex gap-2 rounded-xl bg-status-warning-bg p-3 text-sm text-status-warning-fg"><AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />Laporan ini akan tercatat terlambat (lewat pukul 17.00).</p>}
      <SheetFooter className="px-0 pb-0 sm:flex-col">
        <Button type="button" variant="outline" className="min-h-12 border-[#d8c3b6] bg-white text-[#75442d] hover:bg-[#f7eee8]" onClick={() => onOpenChange(false)}>Periksa lagi</Button>
        <Button type="button" className="min-h-12 bg-[#9c471d] text-white hover:bg-[#823b19]" onClick={onContinue}>Data sudah sesuai</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>;
}

export function FinalSubmitDialog({ open, onOpenChange, onConfirm, busy }: {
  open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; busy: boolean;
}) {
  return <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
    <DialogContent role="alertdialog" aria-labelledby="final-submit-title" aria-describedby="final-submit-description" showCloseButton={false} className="gap-4 border border-[#e8d9cf] bg-[#fffaf7] text-[#1d1c1b]">
      <DialogHeader>
        <DialogTitle id="final-submit-title" className="text-lg font-bold text-[#1d1c1b]">Kirim laporan ini sekarang?</DialogTitle>
        <DialogDescription id="final-submit-description" className="text-[#64564d]">Foto akan diunggah dan laporan akan disimpan. Setelah terkirim, laporan tercatat untuk tanggal ini.</DialogDescription>
      </DialogHeader>
      <DialogFooter className="border-[#e8d9cf] bg-[#f7f3ef]">
        <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)} className="border-[#d8c3b6] bg-white text-[#75442d] hover:bg-[#f7eee8]">Batal</Button>
        <Button type="button" disabled={busy} className="bg-[#9c471d] text-white hover:bg-[#823b19]" onClick={onConfirm}>Ya, kirim laporan</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
