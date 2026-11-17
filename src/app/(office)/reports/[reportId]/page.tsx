import type { Metadata } from "next";
import { ReportDetailContent } from "@/components/office/report/ReportDetailContent";

export const instant = false;

export const metadata: Metadata = {
  title: "Detail Laporan | ArchiStudio Office",
};

export default async function OfficeReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  return <ReportDetailContent reportId={reportId} backHref="/reports" />;
}
