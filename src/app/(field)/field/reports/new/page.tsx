import { Suspense } from "react";
import type { Metadata } from "next";
import { DailyReportFormShell } from "@/components/field/report/DailyReportFormShell";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Isi Laporan Harian | ArchiStudio Lapangan",
};

export default function NewFieldReportPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
      <DailyReportFormShell />
    </Suspense>
  );
}
