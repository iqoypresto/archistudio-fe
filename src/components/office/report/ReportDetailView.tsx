"use client";

import { Calendar, Edit3, MapPin, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { canOwnerReviseReport } from "@/lib/validation/report-revision.validation";
import type { UserRole } from "@/types/api/auth.types";
import type { DailyReportDetail } from "@/types/api/report.types";
import { ReportPhotoGallery } from "./ReportPhotoGallery";

function formatUtcInTimezone(iso: string | null, timeZone: string): string {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function ReportStatusBadges({ report }: { report: DailyReportDetail }) {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge tone={report.isLate ? "warning" : "success"}>
        {report.isLate ? report.lateLabel ?? "Diunggah terlambat" : "Tepat Waktu"}
      </StatusBadge>
      {report.isRevised && (
        <StatusBadge tone="info">Direvisi (Owner #{report.revisionNo})</StatusBadge>
      )}
      <StatusBadge tone="muted">
        {report.reportType === "WORK" ? "Ada Pekerjaan" : "Hari Tanpa Pekerjaan"}
      </StatusBadge>
    </div>
  );
}

export function ReportDetailView({
  report,
  userRole,
  onOpenReviseModal,
}: {
  report: DailyReportDetail;
  userRole?: UserRole | null;
  onOpenReviseModal?: () => void;
}) {
  const canRevise = canOwnerReviseReport(userRole, report.status);

  return (
    <div className="space-y-4">
      <Card className="border border-border bg-surface">
        <CardHeader className="space-y-2 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <span className="inline-block rounded-md border border-border/80 bg-surface-input px-2 py-0.5 font-mono text-xs font-semibold text-text-primary">
                {report.reportNumber}
              </span>
              <CardTitle className="text-xl font-semibold tracking-tight text-text-primary">
                {report.project.name} — {report.area.name}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                  <Calendar className="size-3.5 text-text-muted" />
                  {report.reportDate}
                </span>
                {report.locationText && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5 text-text-muted" />
                    {report.locationText}
                  </span>
                )}
              </div>
            </div>

            {canRevise && onOpenReviseModal && (
              <Button type="button" onClick={onOpenReviseModal} className="h-9 gap-1.5 text-xs">
                <Edit3 className="size-3.5" />
                Revisi Laporan (Owner)
              </Button>
            )}
          </div>
          <ReportStatusBadges report={report} />
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          {report.reportType === "WORK" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4 rounded-xl border border-border/80 bg-surface-input/70 p-3 text-xs text-text-secondary">
                <span>Cuaca: <strong className="text-text-primary">{report.weather ?? "-"}</strong></span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5 text-text-muted" />
                  Pekerja Hadir: <strong className="font-mono tabular-nums text-text-primary">{report.workerCount ?? 0}</strong> orang
                </span>
              </div>
              <div className="rounded-xl border border-border/80 bg-surface-input/60 p-3.5">
                <p className="text-xs font-medium text-text-muted">Progres Pekerjaan</p>
                <p className="mt-1 whitespace-pre-line text-sm text-text-primary">{report.progressText ?? "-"}</p>
              </div>
              <div className="rounded-xl border border-border/80 bg-surface-input/60 p-3.5">
                <p className="text-xs font-medium text-text-muted">Hambatan / Kendala</p>
                <p className="mt-1 whitespace-pre-line text-sm text-text-primary">{report.obstaclesText ?? "-"}</p>
              </div>
              <div className="rounded-xl border border-border/80 bg-surface-input/60 p-3.5">
                <p className="text-xs font-medium text-text-muted">Rencana Besok</p>
                <p className="mt-1 whitespace-pre-line text-sm text-text-primary">{report.tomorrowPlanText ?? "-"}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 bg-surface-input/60 p-3.5">
              <p className="text-xs font-medium text-text-muted">Alasan Hari Tanpa Pekerjaan</p>
              <p className="mt-1 whitespace-pre-line text-sm text-text-primary">{report.noWorkReason ?? "-"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ReportPhotoGallery photos={report.photos} timeZone={report.project.timezone} />

      <Card className="border border-border bg-surface">
        <CardContent className="flex items-start gap-3 py-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-status-success-fg" />
          <div className="space-y-0.5 text-sm">
            <p className="font-semibold text-text-primary">Paraf Otomatis Supervisor</p>
            <p className="text-text-secondary">
              {report.signedByName ?? report.supervisor.name} ({report.signedByTitle ?? report.supervisor.jobTitle})
            </p>
            <p className="font-mono text-xs text-text-secondary">
              Waktu Kirim: {formatUtcInTimezone(report.submittedAt, report.project.timezone)}
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
