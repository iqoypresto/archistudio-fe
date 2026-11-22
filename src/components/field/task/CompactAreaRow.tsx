import Link from "next/link";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import type { SupervisorAreaTaskStatus } from "@/types/api/report-lock.types";

export function CompactAreaRow({ task }: { task: SupervisorAreaTaskStatus }) {
  const targetDate = task.oldestOverdueDate ?? task.nextRequiredDate;
  const isDraft = Boolean(task.draftReportId && task.draftReportDate === targetDate);
  const params = new URLSearchParams({ areaId: task.areaId, date: targetDate ?? task.todayDate });
  if (isDraft && task.draftReportId) params.set("draftId", task.draftReportId);
  const status = task.isTodayLocked
    ? `${task.overdueBusinessDaysCount} hari tertunggak`
    : task.isTodaySubmitted ? "Sudah terkirim"
      : task.isTodayRestDay ? "Hari libur rutin"
        : targetDate ? isDraft ? "Lanjutkan draf" : "Wajib lapor" : "Belum wajib lapor";
  const icon = task.isTodaySubmitted ? <CheckCircle2 className="size-5 text-status-success-fg" />
    : task.isTodayLocked ? <LockKeyhole className="size-5 text-status-danger-fg" />
      : <ArrowRight className="size-5 text-primary" />;
  const content = <>
    <span className="min-w-0 flex-1">
      <span className="block truncate font-semibold text-text-primary">{task.areaName}</span>
      <span className="block truncate text-sm text-text-secondary">{task.projectName} · {status}</span>
    </span>
    {icon}
  </>;
  const className = "flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-xs";
  return targetDate ? (
    <Link href={`/field/reports/new?${params.toString()}`} className={className}>
      {content}
    </Link>
  ) : <div className={className}>{content}</div>;
}
