import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import type { DailyReportListItem } from "@/types/api/report.types";

function resolveStatusBadge(report: DailyReportListItem) {
  if (report.status === "DRAFT") {
    return { tone: "muted" as const, label: "Draf" };
  }
  if (report.isRevised) {
    return { tone: "info" as const, label: "Direvisi (Owner)" };
  }
  if (report.isLate) {
    return { tone: "warning" as const, label: report.lateLabel ?? "Diunggah terlambat" };
  }
  return { tone: "success" as const, label: "Tepat Waktu" };
}

export function FieldReportCard({ report }: { report: DailyReportListItem }) {
  const badge = resolveStatusBadge(report);
  const href =
    report.status === "DRAFT"
      ? `/field/reports/new?areaId=${report.area.id}&date=${report.reportDate}&draftId=${report.id}`
      : `/field/reports/${report.id}`;

  return (
    <Card className="border border-border bg-surface shadow-xs">
      <CardHeader className="space-y-1.5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="inline-block rounded-md border border-border/80 bg-surface-input px-2 py-0.5 font-mono text-xs font-semibold text-text-primary">
              {report.reportNumber}
            </span>
            <CardTitle className="mt-1 text-base font-bold text-text-primary">
              {report.project.name} — {report.area.name}
            </CardTitle>
          </div>
          <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          <span className="font-mono tabular-nums">{report.reportDate}</span>
          <span>• {report.reportType === "WORK" ? "Ada Pekerjaan" : "Tanpa Pekerjaan"}</span>
          <span>• {report.photoCount} foto</span>
        </div>
      </CardHeader>

      <CardContent>
        <Link
          href={href}
          className={cn(
            buttonVariants({
              variant: report.status === "DRAFT" ? "default" : "outline",
            }),
            "min-h-12 w-full text-base font-semibold",
            report.status === "DRAFT" && "bg-primary text-primary-foreground"
          )}
        >
          {report.status === "DRAFT" ? "Lanjutkan Draf" : "Lihat Detail Laporan"}
        </Link>
      </CardContent>
    </Card>
  );
}
