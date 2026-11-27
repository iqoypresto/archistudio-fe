import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeExifTimestamp,
  readPhotoTakenAt,
} from "@/lib/utils/photo-exif";

interface ExifFixtureOptions {
  dateTag: number;
  date: string;
  offsetTag?: number;
  offset?: string;
}

function createExifJpeg(options: ExifFixtureOptions): ArrayBuffer {
  const encoder = new TextEncoder();
  const dateBytes = encoder.encode(`${options.date}\0`);
  const offsetBytes = options.offset ? encoder.encode(`${options.offset}\0`) : null;
  const entryCount = offsetBytes ? 2 : 1;
  const exifIfdOffset = 26;
  const dateOffset = exifIfdOffset + 2 + entryCount * 12 + 4;
  const offsetOffset = dateOffset + dateBytes.length;
  const tiff = new Uint8Array(dateOffset + dateBytes.length + (offsetBytes?.length ?? 0));
  const view = new DataView(tiff.buffer);

  tiff.set([0x49, 0x49]);
  view.setUint16(2, 42, true);
  view.setUint32(4, 8, true);
  view.setUint16(8, 1, true);
  view.setUint16(10, 0x8769, true);
  view.setUint16(12, 4, true);
  view.setUint32(14, 1, true);
  view.setUint32(18, exifIfdOffset, true);
  view.setUint32(22, 0, true);
  view.setUint16(exifIfdOffset, entryCount, true);
  writeAsciiEntry(view, exifIfdOffset + 2, options.dateTag, dateBytes, dateOffset);
  if (offsetBytes && options.offsetTag) {
    writeAsciiEntry(view, exifIfdOffset + 14, options.offsetTag, offsetBytes, offsetOffset);
    tiff.set(offsetBytes, offsetOffset);
  }
  view.setUint32(exifIfdOffset + 2 + entryCount * 12, 0, true);
  tiff.set(dateBytes, dateOffset);

  const exifHeader = encoder.encode("Exif\0\0");
  const payload = new Uint8Array(exifHeader.length + tiff.length);
  payload.set(exifHeader);
  payload.set(tiff, exifHeader.length);
  const segmentLength = payload.length + 2;
  const jpeg = new Uint8Array(payload.length + 8);
  jpeg.set([0xff, 0xd8, 0xff, 0xe1, segmentLength >> 8, segmentLength & 0xff]);
  jpeg.set(payload, 6);
  jpeg.set([0xff, 0xd9], jpeg.length - 2);
  return jpeg.buffer.slice(jpeg.byteOffset, jpeg.byteOffset + jpeg.byteLength) as ArrayBuffer;
}

function writeAsciiEntry(
  view: DataView,
  entryOffset: number,
  tag: number,
  value: Uint8Array,
  valueOffset: number,
): void {
  view.setUint16(entryOffset, tag, true);
  view.setUint16(entryOffset + 2, 2, true);
  view.setUint32(entryOffset + 4, value.length, true);
  view.setUint32(entryOffset + 8, valueOffset, true);
}

function createPhotoFile(options: ExifFixtureOptions): File {
  return new File([createExifJpeg(options)], "fixture.jpg", { type: "image/jpeg" });
}

describe("TASK-13 EXIF photo metadata", () => {
  it("normalizes DateTimeOriginal with its matching offset", () => {
    assert.equal(
      normalizeExifTimestamp({
        DateTimeOriginal: "2026:11:19 10:15:30",
        OffsetTimeOriginal: "+07:00",
      }),
      "2026-11-19T10:15:30+07:00",
    );
  });

  it("falls back to CreateDate and its matching digitized offset", () => {
    assert.equal(
      normalizeExifTimestamp({
        DateTimeOriginal: "invalid",
        CreateDate: "2026:11:19 10:15:30",
        OffsetTimeDigitized: "+07:00",
      }),
      "2026-11-19T10:15:30+07:00",
    );
  });

  it("returns null when EXIF time is missing or invalid", () => {
    assert.equal(normalizeExifTimestamp(undefined), null);
    assert.equal(
      normalizeExifTimestamp({ DateTimeOriginal: "2026:02:30 10:15:30" }),
      null,
    );
    assert.equal(
      normalizeExifTimestamp({
        DateTimeOriginal: "2026:11:19 10:15:30",
        OffsetTimeOriginal: "invalid",
      }),
      null,
    );
  });

  it("reads a valid DateTimeOriginal from a JPEG EXIF segment", async () => {
    const result = await readPhotoTakenAt(createPhotoFile({
      dateTag: 0x9003,
      date: "2026:11:19 10:15:30",
      offsetTag: 0x9011,
      offset: "+07:00",
    }));
    assert.deepEqual(result, {
      status: "read",
      takenAt: "2026-11-19T10:15:30+07:00",
      sourceTag: "DateTimeOriginal",
    });
  });

  it("reads CreateDate with OffsetTimeDigitized from a JPEG EXIF segment", async () => {
    const result = await readPhotoTakenAt(createPhotoFile({
      dateTag: 0x9004,
      date: "2026:11:19 10:15:30",
      offsetTag: 0x9012,
      offset: "+07:00",
    }));
    assert.deepEqual(result, {
      status: "read",
      takenAt: "2026-11-19T10:15:30+07:00",
      sourceTag: "CreateDate",
    });
  });

  it("classifies missing tags and parse errors without blocking the caller", async () => {
    const missing = await readPhotoTakenAt(new File([new Uint8Array([0]).buffer], "photo.jpg", { type: "image/jpeg" }));
    assert.equal(missing.status, "parse-error");
    assert.equal(missing.takenAt, null);

    const noDate = await readPhotoTakenAt(new File([createExifJpeg({ dateTag: 0x9000, date: "0232" })], "no-date.jpg", { type: "image/jpeg" }));
    assert.deepEqual(noDate, { status: "missing-date", takenAt: null });

    const invalidDate = await readPhotoTakenAt(createPhotoFile({ dateTag: 0x9003, date: "invalid" }));
    assert.deepEqual(invalidDate, {
      status: "invalid-date",
      takenAt: null,
      sourceTag: "DateTimeOriginal",
    });
  });
});
