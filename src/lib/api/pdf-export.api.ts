import { api } from "@/lib/api/axios";

export interface ExportPdfParams {
  projectId: string;
  date: string;
  projectCode?: string;
}

function extractFilename(contentDisposition?: string, fallback = "laporan-harian.pdf"): string {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? fallback;
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export const pdfExportApi = {
  /** Mengunduh file PDF Laporan Harian Opsi A per project per tanggal (US-15, BR-29). */
  async downloadDailyReportPdf(params: ExportPdfParams): Promise<void> {
    const response = await api.get("/exports/daily-report-pdf", {
      params: {
        projectId: params.projectId,
        date: params.date,
      },
      responseType: "blob",
    });

    const fallbackName = `LH-${params.projectCode ?? "PROJ"}-${params.date.replace(/-/g, "")}.pdf`;
    const filename = extractFilename(
      response.headers["content-disposition"] as string | undefined,
      fallbackName,
    );
    const blob = new Blob([response.data as BlobPart], { type: "application/pdf" });
    triggerBrowserDownload(blob, filename);
  },
};
