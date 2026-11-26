import { Suspense } from "react";
import type { Metadata } from "next";
import { DailyReportFormShell } from "@/components/field/report/DailyReportFormShell";
import { Skeleton } from "@/components/ui/skeleton";

export const instant = false;

export const metadata: Metadata = {
  title: "Laporan Baru | ArchiStudio Lapangan",
};

export default function NewFieldReportPage() {
  return (
    <Suspense fallback={<div className="space-y-2"><Skeleton className="h-6 w-44" /><Skeleton className="h-4 w-52" /><Skeleton className="h-4 w-36" /></div>}>
      <DailyReportFormShell />
    </Suspense>
  );
}
