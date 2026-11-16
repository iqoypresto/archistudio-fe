import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  buildDraftBackupKey,
  clearDraftBackup,
  readDraftBackup,
  writeDraftBackup,
} from "@/hooks/local-form-backup.hooks";
import {
  isPastProjectCutoff1700,
  reportFormSchema,
} from "@/lib/validation/report.validation";
import { createMemoryStorage } from "./helpers/http-mock.helper.mjs";

describe("TASK-07 Frontend Form Validation, Cutoff & Local Backup", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: { localStorage: createMemoryStorage() },
      configurable: true,
    });
  });

  afterEach(() => {
    clearDraftBackup(buildDraftBackupKey("area-1", "2026-11-16"));
  });

  it("[AC-08.1 / AC-09.1] memvalidasi skema discriminatedUnion WORK vs NO_WORK", () => {
    const invalidWork = reportFormSchema.safeParse({
      reportType: "WORK",
      progressText: "ab",
      obstaclesText: "",
      tomorrowPlanText: "ab",
      weather: "CERAH",
      workerCount: -1,
    });
    assert.equal(invalidWork.success, false);

    const validWork = reportFormSchema.parse({
      reportType: "WORK",
      progressText: "Pemasangan bekisting selesai",
      obstaclesText: "Tidak ada",
      tomorrowPlanText: "Cor kolom lantai 1",
      weather: "BERAWAN",
      workerCount: 12,
    });
    assert.equal(validWork.reportType, "WORK");

    const invalidNoWork = reportFormSchema.safeParse({
      reportType: "NO_WORK",
      noWorkReason: "ab",
    });
    assert.equal(invalidNoWork.success, false);

    const validNoWork = reportFormSchema.parse({
      reportType: "NO_WORK",
      noWorkReason: "Hujan Lebat",
    });
    assert.equal(validNoWork.reportType, "NO_WORK");
  });

  it("[BR-18] mengevaluasi cutoff jam 17:00 sesuai zona waktu project", () => {
    // 09:00:00 UTC = 16:00:00 WIB (Asia/Jakarta) dan 17:00:00 WITA (Asia/Makassar)
    const utcNine = new Date("2026-11-16T09:00:00.000Z");
    assert.equal(isPastProjectCutoff1700(utcNine, "2026-11-16", "Asia/Jakarta"), false);
    assert.equal(isPastProjectCutoff1700(utcNine, "2026-11-16", "Asia/Makassar"), false);

    // 09:00:01 UTC = 17:00:01 WITA (lewat cutoff di Makassar, belum di Jakarta)
    const utcNineOneSec = new Date("2026-11-16T09:00:01.000Z");
    assert.equal(isPastProjectCutoff1700(utcNineOneSec, "2026-11-16", "Asia/Jakarta"), false);
    assert.equal(isPastProjectCutoff1700(utcNineOneSec, "2026-11-16", "Asia/Makassar"), true);
  });

  it("[NFR-02] menyimpan, membaca, dan menghapus auto-backup form di localStorage", () => {
    const key = buildDraftBackupKey("area-1", "2026-11-16");
    assert.equal(key, "draft-backup:area-1:2026-11-16");

    writeDraftBackup(key, {
      values: { reportType: "WORK", progressText: "Draf progres tersimpan" },
      uploadedPhotos: [
        { storageKey: "projects/p/areas/area-1/2026-11-16/1.jpg", sortOrder: 0 },
      ],
      savedAt: "2026-11-16T10:00:00.000Z",
    });

    const loaded = readDraftBackup(key);
    assert.equal(loaded?.values.progressText, "Draf progres tersimpan");
    assert.equal(loaded?.uploadedPhotos.length, 1);

    clearDraftBackup(key);
    assert.equal(readDraftBackup(key), null);
  });
});
