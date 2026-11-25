import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { api } from "@/lib/api/axios";
import { pdfExportApi } from "@/lib/api/pdf-export.api";

const projectId = "9c63b00c-0c4e-4ac0-9391-71aa5cb8dce1";

describe("TASK-18 Frontend PDF periodik", () => {
  it("[AC-21.1 / BR-37] mengirim project dan bulan ke endpoint PDF bulanan", async () => {
    const previous = api.defaults.adapter;
    let requestUrl = "";
    let requestParams: unknown;
    api.defaults.adapter = async (config) => {
      requestUrl = config.url ?? "";
      requestParams = config.params;
      return { config, status: 400, statusText: "Bad Request", headers: {},
        data: new Blob([JSON.stringify({ error: { code: "INVALID_MONTH", message: "Bulan tidak valid." } })]) };
    };
    try {
      await assert.rejects(pdfExportApi.downloadMonthlyReportPdf({ projectId, month: "2026-11" }), /Bulan tidak valid/);
      assert.equal(requestUrl, "/office/exports/monthly-report-pdf");
      assert.deepEqual(requestParams, { projectId, month: "2026-11" });
    } finally {
      api.defaults.adapter = previous;
    }
  });

  it("[AC-21.2 / BR-38] mengirim range dan mempertahankan DATE_RANGE_TOO_LONG dari API", async () => {
    const previous = api.defaults.adapter;
    let requestUrl = "";
    let requestParams: unknown;
    api.defaults.adapter = async (config) => {
      requestUrl = config.url ?? "";
      requestParams = config.params;
      return { config, status: 400, statusText: "Bad Request", headers: {},
        data: new Blob([JSON.stringify({ error: { code: "DATE_RANGE_TOO_LONG", message: "Rentang tanggal maksimal 7 hari kalender." } })]) };
    };
    try {
      await assert.rejects(pdfExportApi.downloadDailyReportRangePdf({ projectId, fromDate: "2026-11-01", toDate: "2026-11-08" }),
        (error: unknown) => error instanceof Error && "code" in error && error.code === "DATE_RANGE_TOO_LONG");
      assert.equal(requestUrl, "/office/exports/daily-report-range-pdf");
      assert.deepEqual(requestParams, { projectId, fromDate: "2026-11-01", toDate: "2026-11-08" });
    } finally {
      api.defaults.adapter = previous;
    }
  });
});
