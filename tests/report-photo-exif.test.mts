import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeExifTimestamp,
  readPhotoTakenAt,
} from "@/lib/utils/photo-exif";

describe("TASK-13 EXIF photo metadata", () => {
  it("[AC-16.1 / BR-23] normalizes a valid EXIF timestamp with its offset", () => {
    assert.equal(
      normalizeExifTimestamp({
        DateTimeOriginal: "2026:11:19 10:15:30",
        OffsetTimeOriginal: "+07:00",
      }),
      "2026-11-19T10:15:30+07:00",
    );
  });

  it("[AC-16.2 / BR-23] returns null when EXIF time is missing or invalid", () => {
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

  it("[AC-16.2] allows upload to continue when the selected file has no readable EXIF", async () => {
    const file = new File([new Uint8Array([0])], "photo.jpg", { type: "image/jpeg" });
    assert.equal(await readPhotoTakenAt(file), null);
  });
});
