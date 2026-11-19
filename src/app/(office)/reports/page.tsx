import type { Metadata } from "next";
import { OfficeReportListContent } from "@/components/office/report/OfficeReportListContent";

export const instant = false;

export const metadata: Metadata = {
  title: "Laporan Harian | ArchiStudio Office",
};

export default async function OfficeReportsPage({ searchParams }: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const { view } = await searchParams;
  return <OfficeReportListContent view={view === "archive" ? "archive" : "reports"} />;
}
