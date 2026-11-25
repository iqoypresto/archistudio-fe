"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { parseRevisionSnapshot } from "@/lib/validation/report-revision.validation";
import type { DailyReportRevisionDto, WeatherType } from "@/types/api/report.types";

const WEATHER_TEXT: Record<WeatherType, string> = {
  CERAH: "Cerah",
  BERAWAN: "Berawan",
  HUJAN: "Hujan",
};

function formatRevTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(iso))
    .replace(".", ":");
}

function SnapshotPreviewBody({ raw }: { raw: unknown }) {
  const snapshot = parseRevisionSnapshot(raw);
  if (!snapshot) {
    return (
      <pre className="max-h-80 overflow-auto rounded-lg bg-secondary p-3 text-xs">
        {JSON.stringify(raw, null, 2)}
      </pre>
    );
  }
  return (
    <div className="space-y-3.5 text-xs tabular-nums">
      <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-canvas/70">
        <div className="px-3 py-2.5">
          <p className="text-[11px] text-text-muted">Tipe Laporan</p>
          <p className="mt-0.5 font-medium text-text-primary">
            {snapshot.reportType === "WORK" ? "Ada Pekerjaan" : "Tanpa Pekerjaan"}
          </p>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[11px] text-text-muted">Cuaca</p>
          <p className="mt-0.5 font-medium text-text-primary">
            {snapshot.weather ? WEATHER_TEXT[snapshot.weather] : "-"}
          </p>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[11px] text-text-muted">Pekerja Hadir</p>
          <p className="mt-0.5 font-medium text-text-primary">
            {snapshot.workerCount !== null ? `${snapshot.workerCount} orang` : "-"}
          </p>
        </div>
      </div>

      {snapshot.reportType === "WORK" ? (
        <div className="divide-y divide-border/70 rounded-lg border border-border bg-canvas/50 px-3.5">
          <div className="py-2.5">
            <p className="text-[11px] text-text-muted">Progres Pekerjaan</p>
            <p className="mt-1 whitespace-pre-line text-[13px] text-text-primary">
              {snapshot.progressText || "-"}
            </p>
          </div>
          <div className="py-2.5">
            <p className="text-[11px] text-text-muted">Hambatan / Kendala</p>
            <p className="mt-1 whitespace-pre-line text-[13px] text-text-primary">
              {snapshot.obstaclesText || "-"}
            </p>
          </div>
          <div className="py-2.5">
            <p className="text-[11px] text-text-muted">Rencana Besok</p>
            <p className="mt-1 whitespace-pre-line text-[13px] text-text-primary">
              {snapshot.tomorrowPlanText || "-"}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-canvas/50 px-3.5 py-2.5">
          <p className="text-[11px] text-text-muted">Alasan Tanpa Pekerjaan</p>
          <p className="mt-1 whitespace-pre-line text-[13px] text-text-primary">
            {snapshot.noWorkReason || "-"}
          </p>
        </div>
      )}

      <p className="text-xs text-text-muted">
        Dokumentasi: <strong className="text-text-secondary">{snapshot.photos.length} foto</strong>{" "}
        · Paraf:{" "}
        <strong className="text-text-secondary">{snapshot.signedByName ?? "-"}</strong>
      </p>
    </div>
  );
}

export function RevisionHistoryTimeline({
  revisions,
  timeZone,
}: {
  revisions: DailyReportRevisionDto[];
  timeZone: string;
}) {
  const [selectedRev, setSelectedRev] = useState<DailyReportRevisionDto | null>(null);
  if (revisions.length === 0) return null;

  return (
    <>
      <section className="rounded-xl border border-border bg-surface tabular-nums">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
            Riwayat Revisi Owner ({revisions.length})
          </h2>
        </div>

        <ol className="divide-y divide-border/70 px-4">
          {revisions.map((rev) => (
            <li key={rev.id} className="relative space-y-1.5 py-3.5 pl-4">
              <span
                aria-hidden="true"
                className="absolute top-5 left-0 size-1.5 rounded-full bg-text-secondary"
              />
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-text-primary">
                  Revisi #{rev.revisionNo} · {rev.revisedByName}
                </span>
              </div>
              <p className="text-[11px] text-text-muted">{formatRevTime(rev.createdAt, timeZone)}</p>
              <p className="text-xs leading-relaxed text-text-secondary">{rev.changeSummary}</p>
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRev(rev)}
                  className="h-7 px-2.5 text-[11px] text-text-secondary"
                >
                  Lihat Versi Sebelumnya
                </Button>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Dialog open={Boolean(selectedRev)} onOpenChange={(o) => !o && setSelectedRev(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Snapshot Sebelum Revisi #{selectedRev?.revisionNo}</DialogTitle>
          </DialogHeader>
          {selectedRev && <SnapshotPreviewBody raw={selectedRev.previousSnapshotJson} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
