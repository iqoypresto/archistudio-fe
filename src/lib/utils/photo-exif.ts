interface ExifDateTags {
  DateTimeOriginal?: unknown;
  CreateDate?: unknown;
  OffsetTimeOriginal?: unknown;
  OffsetTimeDigitized?: unknown;
}

type ExifDateTag = "DateTimeOriginal" | "CreateDate";

export type PhotoExifReadResult =
  | { status: "read"; takenAt: string; sourceTag: ExifDateTag }
  | { status: "missing-date"; takenAt: null }
  | { status: "invalid-date"; takenAt: null; sourceTag: ExifDateTag }
  | { status: "parse-error"; takenAt: null; errorName: string; errorMessage: string };

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

function readTimestamp(tags: ExifDateTags | null | undefined): PhotoExifReadResult {
  if (!tags) return { status: "missing-date", takenAt: null };
  const candidates: { tag: ExifDateTag; value: unknown; offset: unknown }[] = [
    { tag: "DateTimeOriginal", value: tags.DateTimeOriginal, offset: tags.OffsetTimeOriginal },
    { tag: "CreateDate", value: tags.CreateDate, offset: tags.OffsetTimeDigitized },
  ];
  let invalidTag: ExifDateTag | null = null;
  for (const candidate of candidates) {
    if (candidate.value === undefined || candidate.value === null) continue;
    const takenAt = toPhotoDate(candidate.value, candidate.offset);
    if (takenAt) return { status: "read", takenAt, sourceTag: candidate.tag };
    invalidTag ??= candidate.tag;
  }
  return invalidTag
    ? { status: "invalid-date", takenAt: null, sourceTag: invalidTag }
    : { status: "missing-date", takenAt: null };
}

/** Mengubah tag EXIF mentah menjadi kandidat timestamp untuk API laporan. */
export function normalizeExifTimestamp(tags: ExifDateTags | null | undefined): string | null {
  const result = readTimestamp(tags);
  return result.status === "read" ? result.takenAt : null;
}

function logExifReadFailure(file: File, result: Exclude<PhotoExifReadResult, { status: "read" }>): void {
  if (process.env.NODE_ENV !== "development") return;
  console.warn("[report-photo-exif] Waktu EXIF tidak terbaca.", {
    status: result.status,
    mimeType: file.type || "unknown",
    ...(result.status === "invalid-date" ? { sourceTag: result.sourceTag } : {}),
    ...(result.status === "parse-error"
      ? { errorName: result.errorName, errorMessage: result.errorMessage }
      : {}),
  });
}

/** Membaca waktu dari file asli; kegagalan metadata tidak menghentikan unggah foto. */
export async function readPhotoTakenAt(file: File): Promise<PhotoExifReadResult> {
  try {
    const exifrNamespace = await import("exifr") as typeof import("exifr") & {
      default?: { parse: typeof import("exifr")["parse"] };
    };
    const parseExif = exifrNamespace.parse ?? exifrNamespace.default?.parse;
    if (!parseExif) throw new Error("EXIF parser export is unavailable.");
    const input = typeof FileReader === "undefined"
      ? new Uint8Array(await file.arrayBuffer())
      : file;
    const options: Parameters<typeof parseExif>[1] & { silentErrors: boolean } = {
      pick: ["DateTimeOriginal", "CreateDate", "OffsetTimeOriginal", "OffsetTimeDigitized"],
      reviveValues: false,
      silentErrors: false,
    };
    const tags = (await parseExif(input, options)) as ExifDateTags | undefined;
    const result = readTimestamp(tags);
    if (result.status !== "read") logExifReadFailure(file, result);
    return result;
  } catch (error) {
    const result: PhotoExifReadResult = {
      status: "parse-error",
      takenAt: null,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : "Unknown parser error.",
    };
    logExifReadFailure(file, result);
    return result;
  }
}
