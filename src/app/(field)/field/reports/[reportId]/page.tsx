import type { Metadata } from "next";
import { ReportDetailContent } from "@/components/office/report/ReportDetailContent";

export const instant = false;

export const metadata: Metadata = {
  title: "Detail Laporan | ArchiStudio Lapangan",
};

export default async function FieldReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  return <ReportDetailContent reportId={reportId} backHref="/field/history" surface="field" />;
}
