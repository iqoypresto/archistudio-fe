import { Cloud, CloudRain, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DailyReportDetail, WeatherType } from "@/types/api/report.types";
import { ReportDetailSectionCard } from "./ReportDetailSectionCard";

const WEATHER_LABEL: Record<WeatherType, string> = {
  CERAH: "Cerah",
  BERAWAN: "Berawan",
  HUJAN: "Hujan",
};

const WEATHER_ICON: Record<WeatherType, LucideIcon> = {
  CERAH: Sun,
  BERAWAN: Cloud,
  HUJAN: CloudRain,
};

function SummaryFact({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={`min-w-0 px-2.5 py-1.5 ${className ?? ""}`}>
      <dt className="text-sm leading-5 text-[#6b605c]">{label}</dt>
      <dd className="mt-0.5 flex min-w-0 items-center gap-1.5 break-words text-base font-bold leading-6 text-[#1d1c1b]">
        {Icon && <Icon className="size-5 shrink-0 text-[#c97848]" aria-hidden="true" />}
        <span className="min-w-0 break-words">{value}</span>
      </dd>
    </div>
  );
}

export function ReportSummaryCard({ report }: { report: DailyReportDetail }) {
  if (report.reportType === "NO_WORK") {
    return (
      <ReportDetailSectionCard title="Ringkasan" contentClassName="space-y-2.5 px-3.5 py-3">
        <div>
          <p className="text-sm leading-5 text-[#6b605c]">Jenis laporan</p>
          <p className="mt-0.5 text-base font-bold leading-6 text-[#1d1c1b]">Hari Tanpa Pekerjaan</p>
        </div>
        <div>
          <p className="text-sm leading-5 text-[#6b605c]">Alasan Hari Tanpa Pekerjaan</p>
          <p className="mt-0.5 break-words whitespace-pre-wrap text-base leading-6 text-[#1d1c1b]">
            {report.noWorkReason?.trim() || "Alasan tidak tercatat."}
          </p>
        </div>
      </ReportDetailSectionCard>
    );
  }

  const hasNarrative = Boolean(
    report.progressText?.trim()
      || report.obstaclesText?.trim()
      || report.tomorrowPlanText?.trim()
      || report.noWorkReason?.trim()
      || report.locationText?.trim(),
  );
  const WeatherIcon = report.weather ? WEATHER_ICON[report.weather] : undefined;

  return (
    <ReportDetailSectionCard title="Ringkasan" contentClassName="px-2 py-2">
      <dl className="grid grid-cols-2 divide-x divide-[#ead9cc]">
        <SummaryFact label="Jenis laporan" value="Ada Pekerjaan" />
        {report.weather && (
          <SummaryFact
            label="Cuaca"
            value={WEATHER_LABEL[report.weather]}
            icon={WeatherIcon}
          />
        )}
        {report.workerCount !== null && (
          <SummaryFact
            label="Pekerja hadir"
            value={`${report.workerCount} orang`}
            className="col-span-2 border-t border-[#ead9cc]"
          />
        )}
      </dl>
      {!hasNarrative && (
        <p className="border-t border-[#ead9cc] px-2.5 pt-2.5 text-base text-[#6b605c]">
          Rincian laporan belum tersedia.
        </p>
      )}
    </ReportDetailSectionCard>
  );
}
