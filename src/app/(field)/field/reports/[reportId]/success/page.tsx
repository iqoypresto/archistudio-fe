import type { Metadata } from "next";
import { ReportSuccessContent } from "@/components/field/report/ReportSuccessContent";

export const metadata: Metadata = { title: "Laporan Berhasil Dikirim | ArchiStudio" };

export default async function ReportSuccessPage({ params }: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  return <ReportSuccessContent reportId={reportId} />;
}
