import { PeriodPdfExportContent } from "@/components/office/report/PeriodPdfExportContent";

export default async function ProjectDailyReportsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <PeriodPdfExportContent projectId={projectId} mode="daily" />;
}
