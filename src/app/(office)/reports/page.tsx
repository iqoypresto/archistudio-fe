import type { Metadata } from "next";
import { OfficeReportListContent } from "@/components/office/report/OfficeReportListContent";

export const metadata: Metadata = {
  title: "Laporan Harian | ArchiStudio Office",
};

export default function OfficeReportsPage() {
  return <OfficeReportListContent />;
}
