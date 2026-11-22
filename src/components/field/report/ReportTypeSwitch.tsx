import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReportType } from "@/types/api/report.types";

export function ReportTypeSwitch({ value, disabled, onChange }: {
  value: ReportType;
  disabled: boolean;
  onChange: (value: ReportType) => void;
}) {
  return <div className="grid grid-cols-2 gap-2.5">
    {(["WORK", "NO_WORK"] as const).map((type) => <Button
      key={type} type="button" disabled={disabled} aria-pressed={value === type}
      onClick={() => onChange(type)} variant="outline"
      className={cn("h-auto min-h-14 rounded-xl px-3 py-2 text-sm font-semibold",
        value === type ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-text-secondary")}
    >{type === "WORK" ? "Ada Pekerjaan" : "Hari Tanpa Pekerjaan"}</Button>)}
  </div>;
}
