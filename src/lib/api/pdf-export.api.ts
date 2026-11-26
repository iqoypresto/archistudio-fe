import { ApiError } from "@/lib/api/api-error";
import { api } from "@/lib/api/axios";
import type { ApiResponse } from "@/types/api";

export interface ExportPdfParams {
  projectId: string;
  date: string;
  projectCode?: string;
}

export interface MonthlyPdfParams {
  projectId: string;
  month: string;
}

export interface MonthlyAreaMetricsItem {
  areaCode: string;
  areaName: string;
  requiredDays: number;
  onTime: number;
  late: number;
  missing: number;
}

export interface MonthlyReportSummaryResponse {
  project: { id: string; code: string; name: string };
  month: string;
  areas: MonthlyAreaMetricsItem[];
}

export interface DailyRangePdfParams {
  projectId: string;
  fromDate: string;
  toDate: string;
}

function extractFilename(contentDisposition?: string, fallback = "laporan.pdf"): string {
  return contentDisposition?.match(/filename="?([^";]+)"?/)?.[1] ?? fallback;
}

function savePdf(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

async function requestPdf(path: string, params: Record<string, string>, fallback: string): Promise<void> {
  const response = await api.get(path, { params, responseType: "blob", validateStatus: () => true });
  if (response.status >= 400) await throwPdfError(response.data as Blob, response.status);
  savePdf(new Blob([response.data as BlobPart], { type: "application/pdf" }),
    extractFilename(response.headers["content-disposition"] as string | undefined, fallback));
}

async function throwPdfError(blob: Blob, status: number): Promise<never> {
  type PdfErrorPayload = { error?: { code?: string; message?: string; fields?: Record<string, string[]> } };
  const payload: PdfErrorPayload = await blob.text().then((value) => JSON.parse(value) as PdfErrorPayload)
    .catch((): PdfErrorPayload => ({}));
  const error = payload.error;
  const fields = Object.entries(error?.fields ?? {}).flatMap(([field, messages]) =>
    messages.map((message) => ({ field, message })));
  throw new ApiError(error?.code ?? "UNKNOWN_ERROR", error?.message ?? "Gagal membuat PDF.", status, fields);
}

export const pdfExportApi = {
  async downloadDailyReportPdf(params: ExportPdfParams): Promise<void> {
    await requestPdf("/office/exports/daily-report-pdf", { projectId: params.projectId, date: params.date },
      `LH-${params.projectCode ?? "PROJ"}-${params.date.replace(/-/g, "")}.pdf`);
  },
  async downloadMonthlyReportPdf(params: MonthlyPdfParams): Promise<void> {
    await requestPdf("/office/exports/monthly-report-pdf", { projectId: params.projectId, month: params.month },
      `laporan-bulanan-${params.month}.pdf`);
  },
  async getMonthlyReportSummary(params: MonthlyPdfParams): Promise<MonthlyReportSummaryResponse> {
    const response = await api.get<ApiResponse<MonthlyReportSummaryResponse>>(
      "/office/exports/monthly-report-summary",
      { params: { projectId: params.projectId, month: params.month } },
    );
    return response.data.data;
  },
  async downloadDailyReportRangePdf(params: DailyRangePdfParams): Promise<void> {
    await requestPdf("/office/exports/daily-report-range-pdf", {
      projectId: params.projectId, fromDate: params.fromDate, toDate: params.toDate,
    }, `laporan-harian-${params.fromDate}-${params.toDate}.pdf`);
  },
};
