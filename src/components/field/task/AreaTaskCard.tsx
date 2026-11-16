import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Lock, PlusCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import type { SupervisorAreaTaskStatus } from "@/types/api/report-lock.types";

const TIMEZONE_LABELS: Record<string, string> = {
  "Asia/Jakarta": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT",
};

function formatTimezoneShort(timeZone: string): string {
  return TIMEZONE_LABELS[timeZone] ?? timeZone;
}

function buildReportHref(task: SupervisorAreaTaskStatus, targetDate: string): string {
  const params = new URLSearchParams({ areaId: task.areaId, date: targetDate });
  if (task.draftReportId && task.draftReportDate === targetDate) {
    params.set("draftId", task.draftReportId);
  }
  return `/field/reports/new?${params.toString()}`;
}

function LockedBacklogSection({ task }: { task: SupervisorAreaTaskStatus }) {
  const oldestDate = task.oldestOverdueDate ?? task.nextRequiredDate ?? task.todayDate;
  const isResumingDraft =
    Boolean(task.draftReportId) && task.draftReportDate === oldestDate;

  return (
    <div className="space-y-3">
      <div
        role="alert"
        className="rounded-xl border border-status-danger-fg/30 bg-status-danger-bg p-3.5 text-status-danger-fg"
      >
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div className="space-y-1.5 text-sm">
            <p className="text-base font-bold">
              Tertunggak {task.overdueBusinessDaysCount} hari kerja
            </p>
            <p className="text-text-primary">
              Isi berurutan dari tanggal terlama sebelum laporan hari ini dibuka:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {task.overdueDates.map((dateStr) => (
                <span
                  key={dateStr}
                  className="rounded-md bg-surface px-2 py-0.5 font-mono text-sm font-semibold tabular-nums text-status-danger-fg ring-1 ring-status-danger-fg/20"
                >
                  {dateStr}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Link
        href={buildReportHref(task, oldestDate)}
        className={cn(
          buttonVariants({ variant: "default" }),
          "min-h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary-hover"
        )}
      >
        <PlusCircle className="mr-2 size-5" />
        {isResumingDraft ? `Lanjutkan Draf ${oldestDate}` : `Isi Laporan ${oldestDate}`}
      </Link>

      <Button
        type="button"
        variant="outline"
        disabled
        className="min-h-12 w-full text-base text-text-secondary"
      >
        <Lock className="mr-2 size-5" />
        Laporan Hari Ini ({task.todayDate}) Terkunci
      </Button>
    </div>
  );
}

function TodayActionSection({ task }: { task: SupervisorAreaTaskStatus }) {
  if (task.isTodaySubmitted) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-status-success-fg/25 bg-status-success-bg p-3.5 text-base font-medium text-status-success-fg">
        <CheckCircle2 className="size-5 shrink-0" />
        <span>Laporan hari ini ({task.todayDate}) sudah terkirim.</span>
      </div>
    );
  }
  if (task.isTodayRestDay || !task.nextRequiredDate) {
    return (
      <p className="rounded-xl bg-status-muted-bg p-3.5 text-base text-status-muted-fg">
        {task.isTodayRestDay
          ? "Hari libur rutin project — tidak ada kewajiban lapor hari ini."
          : `Penugasan aktif mulai ${task.assignmentStartDate}.`}
      </p>
    );
  }
  const isDraft =
    Boolean(task.draftReportId) && task.draftReportDate === task.nextRequiredDate;
  return (
    <Link
      href={buildReportHref(task, task.nextRequiredDate)}
      className={cn(
        buttonVariants({ variant: "default" }),
        "min-h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary-hover"
      )}
    >
      <PlusCircle className="mr-2 size-5" />
      {isDraft ? "Lanjutkan Draf Hari Ini" : "Buat Laporan Hari Ini"}
    </Link>
  );
}

export function AreaTaskCard({ task }: { task: SupervisorAreaTaskStatus }) {
  return (
    <Card className="border border-border bg-surface shadow-xs">
      <CardHeader className="space-y-1.5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold text-primary uppercase">
              {task.projectCode} / {task.areaCode}
            </p>
            <CardTitle className="text-lg font-bold text-text-primary">
              {task.areaName}
            </CardTitle>
            <p className="text-base text-text-secondary">{task.projectName}</p>
          </div>
          <StatusBadge tone={task.isTodayLocked ? "danger" : task.isTodaySubmitted ? "success" : "info"}>
            {task.isTodayLocked ? "Terkunci" : task.isTodaySubmitted ? "Terkirim" : "Wajib Lapor"}
          </StatusBadge>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
            <Clock className="size-4" />
            Batas 17:00 {formatTimezoneShort(task.timezone)}
          </span>
          <span className="font-mono tabular-nums">Tanggal: {task.todayDate}</span>
        </div>
      </CardHeader>

      <CardContent>
        {task.isTodayLocked ? (
          <LockedBacklogSection task={task} />
        ) : (
          <TodayActionSection task={task} />
        )}
      </CardContent>
    </Card>
  );
}
