"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Edit3, MapPin, ShieldCheck, Users } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { canOwnerReviseReport } from "@/lib/validation/report-revision.validation";
import type { UserRole } from "@/types/api/auth.types";
import type { DailyReportDetail, DailyReportPhotoDto } from "@/types/api/report.types";

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
      <StatusBadge tone={report.status === "DRAFT" ? "muted" : report.isLate ? "warning" : "success"}>
        {report.status === "DRAFT"
          ? "Draf"
          : report.isLate
            ? "Terlambat (> 17:00)"
            : "Tepat Waktu"}
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
  const [zoomPhoto, setZoomPhoto] = useState<DailyReportPhotoDto | null>(null);
  const canRevise = canOwnerReviseReport(userRole, report.status);

  return (
    <div className="space-y-4">
      <Card className="border border-border bg-surface">
        <CardHeader className="space-y-2 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="font-mono text-xs font-semibold text-primary">
                {report.reportNumber}
              </p>
              <CardTitle className="text-xl font-bold text-text-primary">
                {report.project.name} — {report.area.name}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                  <Calendar className="size-4" />
                  {report.reportDate}
                </span>
                {report.locationText && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-4" />
                    {report.locationText}
                  </span>
                )}
              </div>
            </div>

            {canRevise && onOpenReviseModal && (
              <Button type="button" onClick={onOpenReviseModal} className="min-h-11 bg-primary text-primary-foreground">
                <Edit3 className="mr-2 size-4" />
                Revisi Laporan (Owner)
              </Button>
            )}
            {userRole === "SUPERVISOR" && report.status === "DRAFT" && (
              <Link
                href={`/field/reports/new?areaId=${report.area.id}&date=${report.reportDate}&draftId=${report.id}`}
                className={cn(buttonVariants({ variant: "default" }), "min-h-12 bg-primary text-primary-foreground")}
              >
                Lanjutkan Edit Draf
              </Link>
            )}
          </div>
          <ReportStatusBadges report={report} />
        </CardHeader>

        <CardContent className="space-y-4 text-sm sm:text-base">
          {report.reportType === "WORK" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4 rounded-xl bg-secondary/60 p-3 text-sm">
                <span>Cuaca: <strong>{report.weather ?? "-"}</strong></span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-4" />
                  Pekerja Hadir: <strong className="font-mono tabular-nums">{report.workerCount ?? 0}</strong> orang
                </span>
              </div>
              <div>
                <p className="font-semibold text-text-primary">Progres Pekerjaan</p>
                <p className="mt-1 whitespace-pre-line text-text-secondary">{report.progressText ?? "-"}</p>
              </div>
              <div>
                <p className="font-semibold text-text-primary">Hambatan / Kendala</p>
                <p className="mt-1 whitespace-pre-line text-text-secondary">{report.obstaclesText ?? "-"}</p>
              </div>
              <div>
                <p className="font-semibold text-text-primary">Rencana Besok</p>
                <p className="mt-1 whitespace-pre-line text-text-secondary">{report.tomorrowPlanText ?? "-"}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-text-primary">Alasan Hari Tanpa Pekerjaan</p>
              <p className="mt-1 whitespace-pre-line text-text-secondary">{report.noWorkReason ?? "-"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border bg-surface">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Dokumentasi Foto ({report.photos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {report.photos.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setZoomPhoto(photo)}
              className="group overflow-hidden rounded-xl border border-border bg-canvas text-left"
            >
              <Image
                src={photo.signedViewUrl || "/file.svg"}
                alt={photo.caption ?? `Foto ${idx + 1}`}
                width={320}
                height={240}
                unoptimized
                className="aspect-4/3 w-full object-cover transition-transform group-hover:scale-105"
              />
              <p className="truncate px-2.5 py-2 text-xs text-text-secondary">
                {photo.caption || `Foto #${idx + 1}`}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-border bg-surface">
        <CardContent className="flex items-start gap-3 py-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
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

      <Dialog open={Boolean(zoomPhoto)} onOpenChange={(open) => !open && setZoomPhoto(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{zoomPhoto?.caption || "Pratinjau Foto Laporan"}</DialogTitle>
          </DialogHeader>
          {zoomPhoto && (
            <Image
              src={zoomPhoto.signedViewUrl || "/file.svg"}
              alt={zoomPhoto.caption ?? "Foto"}
              width={900}
              height={675}
              unoptimized
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
