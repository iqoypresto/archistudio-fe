import { Button } from "@/components/ui/button";

export function ReportFooter({ step, disabled, onBack, onNext }: {
  step: 1 | 2 | 3; disabled?: boolean; onBack: () => void; onNext: () => void;
}) {
  return <div className="mt-4 grid grid-cols-[1fr_1.2fr] gap-2 rounded-2xl border border-border bg-surface p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] shadow-lg">
    <Button type="button" variant="outline" disabled={disabled || step === 1} onClick={onBack} className="min-h-12 rounded-xl text-base font-semibold">Kembali</Button>
    <Button type="button" disabled={disabled} onClick={onNext} className="min-h-12 rounded-xl bg-primary text-base font-bold text-primary-foreground">
      {step === 3 ? "Kirim Laporan" : "Lanjut"}
    </Button>
  </div>;
}
