import { Suspense } from "react";
import type { Metadata } from "next";
import { FieldReportsContent } from "@/components/field/report/FieldReportsContent";
import { Skeleton } from "@/components/ui/skeleton";

export const instant = false;

export const metadata: Metadata = {
  title: "Laporan | ArchiStudio Lapangan",
};

export default function FieldReportsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
      <FieldReportsContent />
    </Suspense>
  );
}
