import { FieldReportCard } from "./FieldReportCard";
import type { DailyReportListItem } from "@/types/api/report.types";
import { groupFieldHistoryReports } from "./field-history-date.utils";

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
              <FieldReportCard
                key={report.id}
                report={report}
                variant="history"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
