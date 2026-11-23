import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Laporan Berhasil Dikirim | ArchiStudio" };

export default async function ReportSuccessPage({ params }: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  redirect(`/field/reports?submittedId=${encodeURIComponent(reportId)}`);
}
