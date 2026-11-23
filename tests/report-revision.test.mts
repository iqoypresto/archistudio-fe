import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canOwnerReviseReport,
  parseRevisionSnapshot,
  reviseReportSchema,
} from "@/lib/validation/report-revision.validation";

describe("TASK-09 Frontend Revision Validation, Role Guard & Snapshot Parser", () => {
  it("[AC-14.1 / BR-24] mewajibkan changeSummary >= 3 karakter pada form revisi", () => {
    const tooShort = reviseReportSchema.safeParse({ changeSummary: "ab" });
    assert.equal(tooShort.success, false);

    const valid = reviseReportSchema.parse({
      changeSummary: "Koreksi jumlah pekerja hadir",
      workerCount: 10,
      weather: "CERAH",
    });
    assert.equal(valid.changeSummary, "Koreksi jumlah pekerja hadir");
    assert.equal(valid.workerCount, 10);
  });

  it("[BR-02 / BR-24] mengizinkan tombol revisi hanya bagi OWNER pada laporan SUBMITTED", () => {
    assert.equal(canOwnerReviseReport("OWNER", "SUBMITTED"), true);
    assert.equal(canOwnerReviseReport("ADMIN", "SUBMITTED"), false);
    assert.equal(canOwnerReviseReport("SUPERVISOR", "SUBMITTED"), false);
  });

  it("[ADR-05] mem-parsing previousSnapshotJson secara aman untuk tampilan histori revisi", () => {
    assert.equal(parseRevisionSnapshot(null), null);
    assert.equal(parseRevisionSnapshot({ foo: "bar" }), null);

    const parsed = parseRevisionSnapshot({
      reportType: "WORK",
      progressText: "Cor sloof barat",
      obstaclesText: "Tidak ada",
      tomorrowPlanText: "Bekisting kolom",
      weather: "CERAH",
      workerCount: 8,
      signedByName: "Budi Pengawas",
      photos: [{ id: "p1", storageKey: "k1", caption: "Foto", sortOrder: 0, takenAt: null }],
    });

    assert.ok(parsed);
    assert.equal(parsed.progressText, "Cor sloof barat");
    assert.equal(parsed.workerCount, 8);
    assert.equal(parsed.photos.length, 1);
  });
});
