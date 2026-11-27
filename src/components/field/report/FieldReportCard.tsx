import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import type { DailyReportListItem } from "@/types/api/report.types";
import { formatFieldHistoryDate } from "./field-history-date.utils";

function resolveStatusBadge(report: DailyReportListItem) {
  if (report.isRevised) {
    return { tone: "info" as const, label: "Direvisi (Owner)" };
  }
  if (report.isLate) {
    return { tone: "warning" as const, label: report.lateLabel ?? "Diunggah terlambat" };
  }
  return { tone: "success" as const, label: "Tepat Waktu" };
}

export function FieldReportCard({ report, variant = "default" }: {
  report: DailyReportListItem;
  variant?: "default" | "history";
}) {
  const href = `/field/reports/${report.id}`;
  const areaLabel = [report.area.code, report.area.name].filter(Boolean).join(" · ");

  if (variant === "history") {
    const accessibleLabel = `Lihat detail laporan ${report.reportNumber}, ${report.project.name}, ${areaLabel}, ${formatFieldHistoryDate(report.reportDate)}`;

    return (
      <Card className="relative isolate gap-2 border border-border bg-surface py-3 shadow-xs transition-colors hover:border-primary">
        <CardHeader className="space-y-1.5 pb-0">
          <CardTitle className="text-base font-bold text-text-primary">
            <time dateTime={report.reportDate}>
              {formatFieldHistoryDate(report.reportDate)}
            </time>
          </CardTitle>
          <div className="space-y-0.5 break-words text-sm leading-5 text-text-secondary">
            <p>{report.project.name}</p>
            <p>{areaLabel}</p>
          </div>
        </CardHeader>
        <Link
          href={href}
          aria-label={accessibleLabel}
          className="absolute inset-0 z-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
        />
        <CardContent className="pointer-events-none relative z-10">
          <Link
            href={href}
            aria-label={`Lihat detail laporan ${report.reportNumber}`}
            className={cn(
              buttonVariants({ variant: "default" }),
              "pointer-events-auto min-h-12 w-full bg-[var(--project-action)] text-base font-semibold text-white hover:bg-[var(--project-action-hover)]",
            )}
          >
            Lihat detail
          </Link>
        </CardContent>
      </Card>
    );
  }

  const badge = resolveStatusBadge(report);

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
              variant: "default",
            }),
            "min-h-12 w-full bg-[var(--project-action)] text-base font-semibold text-white hover:bg-[var(--project-action-hover)]",
          )}
        >
          Lihat Detail Laporan
        </Link>
      </CardContent>
    </Card>
  );
}
