import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ReportDetailSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Memuat detail laporan" className="space-y-4">
      <span className="sr-only">Memuat detail laporan...</span>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-6 w-full max-w-sm" />
      </div>
      <Card className="gap-3 border border-border bg-surface py-4 shadow-none ring-0">
        <CardHeader className="space-y-2 px-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-full max-w-xs" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-full" />
        </CardContent>
      </Card>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}
