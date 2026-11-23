import Link from "next/link";
import { CalendarDays, CheckCircle2, ChevronRight, LockKeyhole } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SupervisorAreaTaskStatus } from "@/types/api/report-lock.types";

function formatReportDate(date: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function ReportObligationCard({
  task,
  date,
  dateIndex,
  totalDates,
  isUnlocked,
}: {
  task: SupervisorAreaTaskStatus;
  date: string;
  dateIndex: number;
  totalDates: number;
  isUnlocked: boolean;
}) {
  const isOverdue = date < task.todayDate;
  const href = `/field/reports/new?${new URLSearchParams({ areaId: task.areaId, date })}`;

  return (
    <Card className="rounded-2xl border-border bg-surface py-0 shadow-xs">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">{task.projectName}</p>
            <p className="mt-0.5 truncate text-sm text-text-secondary">{task.areaCode} · {task.areaName}</p>
          </div>
          <span className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
            isUnlocked ? isOverdue ? "bg-status-danger-bg text-status-danger-fg" : "bg-primary-soft text-primary"
              : "bg-status-muted-bg text-status-muted-fg"
          )}>
            {isUnlocked ? isOverdue ? "Tertunggak" : "Perlu dibuat" : "Menunggu urutan"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/70 px-3 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-sm text-text-primary">
            <CalendarDays className="size-4 shrink-0 text-text-secondary" />
            <span className="truncate">{formatReportDate(date)}</span>
          </span>
          <span className="shrink-0 text-xs tabular-nums text-text-secondary">{dateIndex + 1}/{totalDates}</span>
        </div>

        {isUnlocked ? (
          <Link href={href} className={cn(buttonVariants({ variant: "default" }), "min-h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary-hover")}>
            Buat laporan <ChevronRight className="ml-1 size-4" />
          </Link>
        ) : (
          <div className="flex min-h-12 items-center gap-2 rounded-xl border border-border px-3 text-sm text-text-secondary">
            <LockKeyhole className="size-4 shrink-0" />
            Selesaikan laporan tanggal sebelumnya terlebih dahulu.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReportListEmptyState({ areas }: { areas: SupervisorAreaTaskStatus[] }) {
  const completedToday = areas.filter((area) => area.isTodaySubmitted).length;
  const restDayCount = areas.filter((area) => area.isTodayRestDay).length;
  const Icon = completedToday > 0 && completedToday + restDayCount >= areas.length ? CheckCircle2 : CalendarDays;
  const message = areas.every((area) => area.isTodayRestDay)
    ? "Hari ini merupakan hari libur rutin untuk area Anda."
    : completedToday === areas.length
      ? "Laporan hari ini sudah terkirim untuk semua area aktif."
      : "Belum ada kewajiban laporan yang perlu dibuat saat ini.";

  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface px-5 py-8 text-center">
      <Icon className="mx-auto size-8 text-status-success-fg" />
      <p className="mt-3 font-semibold text-text-primary">Semua kewajiban sudah diperiksa</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-text-secondary">{message}</p>
    </div>
  );
}
