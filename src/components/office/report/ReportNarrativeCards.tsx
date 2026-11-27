import type { DailyReportDetail } from "@/types/api/report.types";
import { ReportDetailSectionCard } from "./ReportDetailSectionCard";

const REPORT_TEXT_FIELDS = [
  { key: "progressText", label: "Uraian pekerjaan" },
  { key: "obstaclesText", label: "Hambatan" },
  { key: "tomorrowPlanText", label: "Rencana besok" },
  { key: "noWorkReason", label: "Alasan tanpa pekerjaan" },
  { key: "locationText", label: "Lokasi" },
] as const;

export function ReportNarrativeCards({ report }: { report: DailyReportDetail }) {
  return (
    <>
      {REPORT_TEXT_FIELDS.map(({ key, label }) => {
        if (key === "noWorkReason" && report.reportType === "NO_WORK") return null;
        const value = report[key]?.trim();
        if (!value) return null;

        return (
          <ReportDetailSectionCard key={key} title={label}>
            <p className="break-words whitespace-pre-wrap text-sm leading-5 text-[#1d1c1b]">
              {value}
            </p>
          </ReportDetailSectionCard>
        );
      })}
    </>
  );
}
