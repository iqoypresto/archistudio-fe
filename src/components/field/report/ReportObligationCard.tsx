import Link from "next/link";
import { ArrowRight, CalendarDays, LockKeyhole } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SupervisorReportWorkItem } from "@/types/api/report-lock.types";

function formatReportDate(date: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function ReportObligationCard({
  item,
}: { item: SupervisorReportWorkItem }) {
  const statusPresentation = {
    LATE: { label: "Terlambat", tone: "bg-status-warning-bg text-status-warning-fg" },
    OVERDUE: { label: "Tertunggak", tone: "bg-status-danger-bg text-status-danger-fg" },
    READY: { label: "Perlu dibuat", tone: "bg-primary-soft text-primary" },
    WAITING: { label: "Menunggu urutan", tone: "bg-status-muted-bg text-status-muted-fg" },
  }[item.status];
  const actionHref = item.action === "VIEW_REPORT" && item.reportId
    ? `/field/reports/${item.reportId}`
    : `/field/reports/new?${new URLSearchParams({ areaId: item.areaId, date: item.reportDate })}`;

  return (
    <Card className="rounded-2xl border-border bg-surface py-0 shadow-xs">
      <CardContent className="space-y-1.5 p-3">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 truncate rounded-lg bg-[var(--project-canvas)] px-2 py-1.5 text-base font-bold text-text-primary">{item.projectName}</p>
          <span className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
            statusPresentation.tone,
          )}>
            {statusPresentation.label}
          </span>
        </div>

        <div className="border-t border-border" />

        <div className="space-y-1.5 px-2">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="shrink-0 text-sm font-medium text-text-secondary">Area</span>
            <p className="min-w-0 truncate text-sm font-semibold text-text-primary">
              {item.areaCode} · {item.areaName}
            </p>
          </div>

          <div className="flex min-h-9 items-center">
            <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-text-primary">
              <CalendarDays className="size-4 shrink-0 text-[#c45b19]" />
              <span>{formatReportDate(item.reportDate)}</span>
            </span>
          </div>

          {item.action !== "WAIT" ? (
            <Link href={actionHref} className={cn(buttonVariants({ variant: "default" }), "min-h-11 w-full justify-center gap-2 rounded-lg bg-[var(--project-action)] px-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[var(--project-action-hover)]")}>
              <span>{item.action === "VIEW_REPORT" ? "Lihat laporan" : "Buat laporan"}</span>
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <Button type="button" disabled variant="outline" className="min-h-11 w-full justify-center gap-2 rounded-lg border border-status-danger-fg/20 bg-status-danger-bg px-2 text-center text-xs font-medium leading-tight text-status-danger-fg whitespace-normal disabled:opacity-100 [&_svg]:text-status-danger-fg">
              <LockKeyhole className="size-4 shrink-0" />
              <span className="min-w-0 whitespace-normal text-center">Selesaikan laporan sebelumnya.</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
