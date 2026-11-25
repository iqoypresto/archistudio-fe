const TIMEZONE_SHORT_MAP: Record<string, string> = {
  "Asia/Jakarta": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT",
};

export function getTodayInJakarta(): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const val = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${val("year")}-${val("month")}-${val("day")}`;
}

export function formatShortTimezone(tz?: string | null): string {
  if (!tz) return "WIB";
  return TIMEZONE_SHORT_MAP[tz] ?? tz;
}

export function formatIdDate(value?: string | null): string {
  if (!value) return "-";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTimeInTimezone(
  isoValue?: string | null,
  timezone = "Asia/Jakarta",
): string | null {
  if (!isoValue) return null;
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return null;
  try {
    const time = new Intl.DateTimeFormat("id-ID", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
    return `${time.replace(".", ":")} ${formatShortTimezone(timezone)}`;
  } catch {
    return null;
  }
}

export function formatDateTimeId(isoValue?: string | null): string {
  if (!isoValue) return "-";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return isoValue;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(".", ":");
}

export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
