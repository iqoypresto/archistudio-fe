import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { api } from "@/lib/api/axios";
import { pdfExportApi } from "@/lib/api/pdf-export.api";
import {
  calculateOnTimePercentage,
  resolveAreaStatusBadgeTone,
  unlockAreaFormSchema,
} from "@/lib/validation/dashboard.validation";

describe("TASK-08 Frontend Dashboard Monitoring, Buka Kunci & Export PDF", () => {
  it("[AC-11.1 / BR-22] unlockAreaFormSchema menolak tanggal tidak valid atau alasan < 5 karakter", () => {
    const invalidDate = unlockAreaFormSchema.safeParse({
      unlockedThroughDate: "05-11-2026",
      reason: "Alasan dispensasi cuaca",
    });
    assert.equal(invalidDate.success, false);

    const tooShortReason = unlockAreaFormSchema.safeParse({
      unlockedThroughDate: "2026-11-05",
      reason: "abc",
    });
    assert.equal(tooShortReason.success, false);

    const valid = unlockAreaFormSchema.parse({
      unlockedThroughDate: "2026-11-05",
      reason: "Dispensasi cuaca buruk dan pemadaman listrik",
    });
    assert.equal(valid.unlockedThroughDate, "2026-11-05");
    assert.equal(valid.reason, "Dispensasi cuaca buruk dan pemadaman listrik");
  });

  it("[BR-21] calculateOnTimePercentage menghitung persentase ketepatan waktu dengan benar", () => {
    assert.equal(calculateOnTimePercentage(0, 0), 100);
    assert.equal(calculateOnTimePercentage(5, 10), 50);
    assert.equal(calculateOnTimePercentage(8, 10), 80);
    assert.equal(calculateOnTimePercentage(10, 10), 100);
  });

  it("[BR-11 / BR-18 / Wave 1A] resolveAreaStatusBadgeTone memetakan semua status harian area termasuk belum ditugaskan & di luar jadwal", () => {
    assert.equal(resolveAreaStatusBadgeTone("TERKIRIM"), "success");
    assert.equal(resolveAreaStatusBadgeTone("TERLAMBAT"), "warning");
    assert.equal(resolveAreaStatusBadgeTone("BELUM_DITUGASKAN"), "warning");
    assert.equal(resolveAreaStatusBadgeTone("BELUM_LAPOR"), "danger");
    assert.equal(resolveAreaStatusBadgeTone("LIBUR_RUTIN"), "muted");
    assert.equal(resolveAreaStatusBadgeTone("DI_LUAR_JADWAL"), "muted");
  });

  it("[AC-27.1 / BR-30] menampilkan error API dan area yang belum lengkap pada respons Blob", async () => {
    const previous = api.defaults.adapter;
    api.defaults.adapter = async (config) => ({
      config,
      status: 409,
      statusText: "Conflict",
      headers: {},
      data: new Blob([JSON.stringify({ success: false, error: {
        code: "DAILY_REPORTS_INCOMPLETE",
        message: "PDF belum dapat dibuat.",
        fields: { missingAreas: ["A — Struktur"] },
      } })], { type: "application/json" }),
    });
    try {
      await assert.rejects(pdfExportApi.downloadDailyReportPdf({ projectId: "project-1", date: "2026-11-16" }),
        (error: unknown) => error instanceof Error && error.message === "PDF belum dapat dibuat." &&
          "fields" in error && Array.isArray(error.fields) && error.fields[0]?.message === "A — Struktur");
    } finally {
      api.defaults.adapter = previous;
    }
  });
});
