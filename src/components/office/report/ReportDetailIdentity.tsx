import { Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTimeInTimezone } from "@/lib/utils/office-format";
import type { DailyReportDetail } from "@/types/api/report.types";

function formatReportDate(value: string): string {
  const date = new Date(`${value}T12:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatSentAt(value: string | null): string {
  if (!value) return "Waktu pengiriman tidak tercatat";
  const date = new Date(value);
  const time = formatTimeInTimezone(value, "Asia/Jakarta");
  if (Number.isNaN(date.getTime()) || !time) return "Waktu pengiriman tidak tercatat";
  const sentDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
  return `Dikirim ${sentDate}, ${time}`;
}

export function ReportDetailIdentity({ report }: { report: DailyReportDetail }) {
  const lateLabel = report.lateLabel || "Terlambat";

  return (
    <section className="space-y-2.5">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <h1 className="break-words text-xl font-bold leading-6 text-[#1d1c1b]">
            {report.area.name}
          </h1>
          <p className="break-words text-sm font-medium leading-5 text-[#1d1c1b]">
            {formatReportDate(report.reportDate)}
          </p>
          <p className="break-words text-xs leading-5 text-[#6b605c]">
            {formatSentAt(report.submittedAt)}
          </p>
        </div>
        {report.isLate && (
          <Badge className="mt-0.5 flex h-auto max-w-[44%] shrink-0 items-center gap-1.5 whitespace-normal rounded-lg border-0 bg-[#b8442a] px-2.5 py-1.5 text-xs font-semibold leading-4 text-white hover:bg-[#a43c26]">
            <Clock3 className="size-4 shrink-0" aria-hidden="true" />
            <span className="break-words">{lateLabel}</span>
          </Badge>
        )}
      </div>

      <div className="space-y-1">
        <p className="break-words text-base font-semibold leading-5 text-black">
          {report.project.name}
        </p>
        {report.isRevised && (
          <p className="text-xs leading-4 text-[#6b605c]">Direvisi #{report.revisionNo}</p>
        )}
      </div>
    </section>
  );
}
