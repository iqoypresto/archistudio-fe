"use client";

import { Calendar, MapPin, ShieldCheck } from "lucide-react";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import {
  formatIdDate,
  formatShortTimezone,
  formatTimeInTimezone,
} from "@/lib/utils/office-format";
import type { DailyReportDetail, WeatherType } from "@/types/api/report.types";
import { ReportPhotoGallery } from "./ReportPhotoGallery";
import { RevisionHistoryTimeline } from "./RevisionHistoryTimeline";

const WEATHER_LABEL: Record<WeatherType, string> = {
  CERAH: "Cerah",
  BERAWAN: "Berawan",
  HUJAN: "Hujan",
};

export function ReportDetailView({ report }: { report: DailyReportDetail }) {
  const sentTime = formatTimeInTimezone(report.submittedAt, report.project.timezone);
  const weatherText = report.weather ? WEATHER_LABEL[report.weather] : "-";

  return (
    <div className="space-y-5 tabular-nums">
      <header className="space-y-2 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          <span className="font-medium text-text-secondary">{report.reportNumber}</span>
          <span>·</span>
          <StatusIndicator tone={report.isLate ? "warning" : "success"} className="text-xs">
            {report.isLate ? report.lateLabel ?? "Diunggah Terlambat" : "Tepat Waktu"}
          </StatusIndicator>
          <span>·</span>
          <span>{report.reportType === "WORK" ? "Ada Pekerjaan" : "Hari Tanpa Pekerjaan"}</span>
          {report.isRevised && (
            <>
              <span>·</span>
              <span className="text-text-secondary">Direvisi Owner (#{report.revisionNo})</span>
            </>
          )}
        </div>

        <h1 className="font-heading text-xl font-semibold tracking-tight text-text-primary sm:text-[22px]">
          {report.project.name} — {report.area.code} {report.area.name}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5 text-text-muted" />
            {formatIdDate(report.reportDate)}
            {sentTime ? ` · Dikirim ${sentTime}` : ""}
          </span>
          {report.locationText && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-text-muted" />
              {report.locationText}
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold text-text-primary">Ringkasan Pekerjaan</h2>
            </div>

            {report.reportType === "WORK" ? (
              <div className="divide-y divide-border/70 px-5">
                <div className="py-4">
                  <p className="text-xs font-medium text-text-muted">Progres Pekerjaan</p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-text-primary">
                    {report.progressText || "-"}
                  </p>
                </div>
                <div className="py-4">
                  <p className="text-xs font-medium text-text-muted">Hambatan / Kendala</p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-text-primary">
                    {report.obstaclesText || "Tidak ada hambatan tercatat."}
                  </p>
                </div>
                <div className="py-4">
                  <p className="text-xs font-medium text-text-muted">Rencana Besok</p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-text-primary">
                    {report.tomorrowPlanText || "-"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-5 py-4">
                <p className="text-xs font-medium text-text-muted">Alasan Hari Tanpa Pekerjaan</p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-text-primary">
                  {report.noWorkReason || "-"}
                </p>
              </div>
            )}
          </section>

          <ReportPhotoGallery photos={report.photos} timeZone={report.project.timezone} />
        </div>

        <aside className="space-y-5">
          {report.reportType === "WORK" && (
            <section className="rounded-xl border border-border bg-surface">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                  Kondisi Lapangan
                </h2>
              </div>
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="px-4 py-3.5">
                  <p className="text-xs text-text-muted">Cuaca</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{weatherText}</p>
                </div>
                <div className="px-4 py-3.5">
                  <p className="text-xs text-text-muted">Pekerja Hadir</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">
                    {report.workerCount ?? 0} orang
                  </p>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                Paraf Pengirim
              </h2>
              <ShieldCheck className="size-4 text-status-success-fg" aria-hidden="true" />
            </div>
            <div className="space-y-1 px-4 py-3.5 text-xs">
              <p className="text-sm font-semibold text-text-primary">
                {report.signedByName ?? report.supervisor.name}
              </p>
              <p className="text-text-secondary">
                {report.signedByTitle ?? report.supervisor.jobTitle}
              </p>
              <p className="pt-1 text-text-muted">
                Terkirim {formatIdDate(report.reportDate)}
                {sentTime ? ` · ${sentTime}` : ` (${formatShortTimezone(report.project.timezone)})`}
              </p>
            </div>
          </section>

          <RevisionHistoryTimeline
            revisions={report.revisions}
            timeZone={report.project.timezone}
          />
        </aside>
      </div>
    </div>
  );
}
