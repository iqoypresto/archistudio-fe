interface ExifDateTags {
  DateTimeOriginal?: unknown;
  CreateDate?: unknown;
  OffsetTimeOriginal?: unknown;
  OffsetTime?: unknown;
}

function normalizeOffset(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return null;
  if (value.trim().toUpperCase() === "Z") return "Z";
  const match = /^([+-])(\d{2}):?(\d{2})$/.exec(value.trim());
  if (!match) return null;
  return `${match[1]}${match[2]}:${match[3]}`;
}

function toPhotoDate(value: unknown, rawOffset: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day, hour, minute, second, fraction = ""] = match;
  const values = [year, month, day, hour, minute, second].map(Number);
  const [yearNumber, monthNumber, dayNumber, hourNumber, minuteNumber, secondNumber] = values;
  const date = new Date(Date.UTC(
    yearNumber,
    monthNumber - 1,
    dayNumber,
    hourNumber,
    minuteNumber,
    secondNumber,
  ));
  const actual = [
    date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(),
    date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(),
  ];
  if (values.some((part, index) => part !== actual[index])) return null;
  const wallClock = `${year}-${month}-${day}T${hour}:${minute}:${second}${fraction ? `.${fraction}` : ""}`;
  const offset = normalizeOffset(rawOffset);
  if (offset === null) return null;
  const timestamp = offset ? `${wallClock}${offset}` : wallClock;
  return Number.isNaN(new Date(timestamp).getTime()) ? null : timestamp;
}

/** Mengubah tag EXIF mentah menjadi kandidat timestamp untuk API laporan. */
export function normalizeExifTimestamp(tags: ExifDateTags | null | undefined): string | null {
  if (!tags) return null;
  const date = tags.DateTimeOriginal ?? tags.CreateDate;
  const offset = tags.OffsetTimeOriginal ?? tags.OffsetTime;
  return toPhotoDate(date, offset);
}

/** EXIF reader is split into the upload path and failures never block photo upload. */
export async function readPhotoTakenAt(file: File): Promise<string | null> {
  try {
    const exifr = await import("exifr");
    const tags = (await exifr.parse(file, {
      pick: ["DateTimeOriginal", "CreateDate", "OffsetTimeOriginal", "OffsetTime"],
      reviveValues: false,
    })) as ExifDateTags | undefined;
    return normalizeExifTimestamp(tags);
  } catch {
    return null;
  }
}
