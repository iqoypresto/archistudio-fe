import type { DailyReportDetail } from "@/types/api/report.types";
import { ReportDetailIdentity } from "./ReportDetailIdentity";
import { ReportDetailSectionCard } from "./ReportDetailSectionCard";
import { ReportNarrativeCards } from "./ReportNarrativeCards";
import { FieldReportPhotoGallery } from "./FieldReportPhotoGallery";
import { ReportRevisionHistory } from "./ReportRevisionHistory";
import { ReportSummaryCard } from "./ReportSummaryCard";

function ReportResponsibleCard({ report }: { report: DailyReportDetail }) {
  const name = report.signedByName || report.supervisor.name;
  const title = report.signedByTitle || report.supervisor.jobTitle;
  if (!name && !title) return null;

  return (
    <ReportDetailSectionCard title="Penanggung Jawab" contentClassName="space-y-0.5 px-3.5 py-2.5">
      {name && <p className="break-words text-sm font-bold leading-5 text-[#1d1c1b]">{name}</p>}
      {title && <p className="break-words text-xs leading-4 text-[#6b605c]">{title}</p>}
    </ReportDetailSectionCard>
  );
}

export function FieldReportDetailView({ report }: { report: DailyReportDetail }) {
  return (
    <div className="min-w-0 space-y-3 tabular-nums">
      <ReportDetailIdentity report={report} />
      <ReportSummaryCard report={report} />
      <ReportNarrativeCards report={report} />
      <FieldReportPhotoGallery photos={report.photos} timeZone={report.project.timezone} />
      <ReportResponsibleCard report={report} />
      <ReportRevisionHistory revisions={report.revisions} timeZone={report.project.timezone} />
      <p role="note" className="px-2 py-1 text-center text-xs italic leading-5 text-[#6b605c]">
        Perlu perbaikan? Hubungi admin kantor.
      </p>
    </div>
  );
}
