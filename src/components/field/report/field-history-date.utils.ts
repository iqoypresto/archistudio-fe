import type { DailyReportListItem } from "@/types/api/report.types";

const BUSINESS_TIME_ZONE = "Asia/Jakarta";

export interface FieldHistoryGroup {
  key: string;
  label: string;
  reports: DailyReportListItem[];
}

function toDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (name: string) => parts.find((entry) => entry.type === name)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function startOfWeek(dateKey: string): string {
  const day = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
  return addDays(dateKey, day === 0 ? -6 : 1 - day);
}

function formatAtJakarta(dateKey: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("id-ID", {
    ...options,
    timeZone: BUSINESS_TIME_ZONE,
  }).format(new Date(`${dateKey}T12:00:00.000Z`));
}

export function formatFieldHistoryDate(dateKey: string): string {
  return formatAtJakarta(dateKey.slice(0, 10), {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatFieldHistoryDateRange(from?: string, to?: string): string {
  if (from && to) {
    return `${formatAtJakarta(from, { day: "numeric", month: "short", year: "numeric" })} – ${formatAtJakarta(to, { day: "numeric", month: "short", year: "numeric" })}`;
  }
  if (from) return `Dari ${formatAtJakarta(from, { day: "numeric", month: "short", year: "numeric" })}`;
  if (to) return `Sampai ${formatAtJakarta(to, { day: "numeric", month: "short", year: "numeric" })}`;
  return "Semua tanggal";
}

export function groupFieldHistoryReports(
  reports: DailyReportListItem[],
  now = new Date(),
): FieldHistoryGroup[] {
  const today = toDateKey(now);
  const currentWeekStart = startOfWeek(today);
  const previousWeekStart = addDays(currentWeekStart, -7);
  const groups = new Map<string, FieldHistoryGroup>();

  for (const report of reports) {
    const reportDate = report.reportDate.slice(0, 10);
    let key: string;
    let label: string;

    if (reportDate >= currentWeekStart && reportDate <= today) {
      key = "current-week";
      label = "Minggu ini";
    } else if (reportDate >= previousWeekStart && reportDate < currentWeekStart) {
      key = "previous-week";
      label = "Minggu lalu";
    } else {
      key = `month-${reportDate.slice(0, 7)}`;
      label = formatAtJakarta(reportDate, { month: "long", year: "numeric" });
    }

    const group = groups.get(key) ?? { key, label, reports: [] };
    group.reports.push(report);
    groups.set(key, group);
  }

  return [...groups.values()];
}
