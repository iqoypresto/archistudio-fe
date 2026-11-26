const STEPS = ["Keterangan", "Foto", "Konfirmasi"] as const;

export function ReportStepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return <ol aria-label="Tahapan laporan" className="grid grid-cols-3">
    {STEPS.map((label, index) => {
      const active = step === index + 1;
      const complete = index + 1 < step;
      return <li key={label} aria-current={active ? "step" : undefined} className="relative flex flex-col items-center text-center">
        {index < STEPS.length - 1 && <span aria-hidden="true" className={`absolute left-1/2 top-4 h-0.5 w-full ${complete ? "bg-primary" : "bg-border"}`} />}
        <span className={`relative z-10 grid size-9 place-items-center rounded-full border-2 text-sm font-semibold ${active || complete ? "border-primary bg-primary text-primary-foreground" : "border-primary/50 bg-surface text-text-secondary"}`}>{index + 1}</span>
        <span className={`mt-1 text-xs ${active ? "font-bold text-text-primary" : "text-text-secondary"}`}>{label}</span>
      </li>;
    })}
  </ol>;
}
