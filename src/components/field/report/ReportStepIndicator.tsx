const STEPS = ["Kondisi", "Foto", "Periksa"] as const;

export function ReportStepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return <ol aria-label="Tahapan laporan" className="grid grid-cols-3 gap-2">
    {STEPS.map((label, index) => <li key={label} aria-current={step === index + 1 ? "step" : undefined}
      className={`rounded-xl px-2 py-3 text-center text-sm font-semibold ${step === index + 1 ? "bg-primary text-primary-foreground" : index + 1 < step ? "bg-primary-soft text-primary" : "bg-surface text-text-secondary"}`}>
      <span className="block text-xs">{index + 1} / 3</span>{label}
    </li>)}
  </ol>;
}
