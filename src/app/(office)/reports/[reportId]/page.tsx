import { redirect } from "next/navigation";

export default async function LegacyReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  redirect(`/office/reports/${reportId}`);
}
