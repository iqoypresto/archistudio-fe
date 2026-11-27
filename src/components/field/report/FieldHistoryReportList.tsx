import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { DailyReportListItem } from "@/types/api/report.types";
import { formatFieldHistoryDate, groupFieldHistoryReports } from "./field-history-date.utils";

export function FieldHistoryReportList({ reports }: {
  reports: DailyReportListItem[];
}) {
  const groups = groupFieldHistoryReports(reports);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.key} aria-label={`Laporan ${group.label}`} className="space-y-3">
          <h2 className="rounded-[1rem] bg-[var(--project-illustration-paper)] px-4 py-2 text-base font-bold text-[var(--project-action)]">
            {group.label}
          </h2>
          <div className="space-y-3">
            {group.reports.map((report) => (
              <HistoryReportCard
                key={report.id}
                report={report}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function HistoryReportCard({ report }: {
  report: DailyReportListItem;
}) {
  const areaLabel = [report.area.code, report.area.name].filter(Boolean).join(" · ");
  const accessibleLabel = `Lihat detail laporan ${report.reportNumber}, ${report.project.name}, ${areaLabel}, ${formatFieldHistoryDate(report.reportDate)}`;

  return (
    <Link
      href={`/field/reports/${report.id}`}
      aria-label={accessibleLabel}
      className="group flex min-h-28 min-w-0 flex-col justify-between gap-2 rounded-[1.125rem] border border-[var(--project-border)] bg-[var(--project-surface)] px-4 py-3 shadow-[var(--project-card-shadow)] transition-colors hover:border-[var(--project-action)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--project-action)]"
    >
      <div className="min-w-0">
        <h3 className="break-words text-lg font-bold leading-6 text-[var(--project-text-heading)]">
          {report.project.name}
        </h3>
        <p className="mt-0.5 break-words text-sm leading-5 text-[var(--project-text-secondary)]">
          {areaLabel}
        </p>
        <time
          dateTime={report.reportDate}
          className="mt-0.5 block text-sm leading-5 text-[var(--project-text-secondary)]"
        >
          {formatFieldHistoryDate(report.reportDate)}
        </time>
      </div>
      <span className="flex min-h-8 items-center justify-end gap-1 text-sm font-bold text-[var(--project-action)] group-hover:text-[var(--project-action-hover)]">
        Lihat detail
        <ChevronRight className="size-5 shrink-0" aria-hidden="true" />
      </span>
    </Link>
  );
}
