"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTH_OPTIONS = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
] as const;

export function MonthYearSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (nextValue: string) => void;
}) {
  const [rawYear, rawMonth] = value.split("-");
  const currentYear = new Date().getFullYear();
  const yearNum = Number(rawYear) || currentYear;
  const monthVal = MONTH_OPTIONS.some((m) => m.value === rawMonth) ? rawMonth : "01";
  const yearSet = new Set<number>([yearNum]);
  for (let y = currentYear - 4; y <= currentYear + 1; y += 1) yearSet.add(y);
  const years = [...yearSet].sort((a, b) => b - a);
  const monthLabel = MONTH_OPTIONS.find((m) => m.value === monthVal)?.label ?? "Januari";

  return (
    <div className="grid grid-cols-[1.35fr_0.85fr] gap-2">
      <Select
        value={monthVal}
        onValueChange={(next: string | null) => next && onChange(`${yearNum}-${next}`)}
      >
        <SelectTrigger aria-label="Pilih bulan kalender" className="h-11 text-sm sm:h-9 sm:text-xs">
          <SelectValue>{monthLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {MONTH_OPTIONS.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(yearNum)}
        onValueChange={(next: string | null) => next && onChange(`${next}-${monthVal}`)}
      >
        <SelectTrigger aria-label="Pilih tahun kalender" className="h-11 text-sm tabular-nums sm:h-9 sm:text-xs">
          <SelectValue>{String(yearNum)}</SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {years.map((year) => (
            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
