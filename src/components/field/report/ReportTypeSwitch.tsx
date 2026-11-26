import { cn } from "@/lib/utils";
import type { ReportType } from "@/types/api/report.types";

export function ReportTypeSwitch({ value, disabled, onChange }: {
  value: ReportType;
  disabled: boolean;
  onChange: (value: ReportType) => void;
}) {
  return <fieldset className="grid grid-cols-2 gap-2.5" aria-label="Jenis laporan">
    <legend className="sr-only">Jenis laporan</legend>
    {(["WORK", "NO_WORK"] as const).map((type) => <label key={type} className={cn("flex min-h-14 cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-center text-sm font-semibold", value === type ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-text-secondary", disabled && "cursor-not-allowed opacity-60")}>
      <input type="radio" name="reportType" value={type} checked={value === type} disabled={disabled} onChange={() => onChange(type)} className="sr-only" />
      <span>{type === "WORK" ? "Ada Pekerjaan" : "Tidak Ada Pekerjaan"}</span>
    </label>)}
  </fieldset>;
}
