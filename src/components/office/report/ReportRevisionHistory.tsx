"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { parseRevisionSnapshot } from "@/lib/validation/report-revision.validation";
import { formatShortTimezone } from "@/lib/utils/office-format";
import type { DailyReportRevisionDto, WeatherType } from "@/types/api/report.types";

const WEATHER_TEXT: Record<WeatherType, string> = {
  CERAH: "Cerah",
  BERAWAN: "Berawan",
  HUJAN: "Hujan",
};

function formatRevisionTime(value: string, timeZone: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  try {
    const formatted = new Intl.DateTimeFormat("id-ID", {
      timeZone,
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date).replace(".", ":");
    return `${formatted} ${formatShortTimezone(timeZone)}`;
  } catch {
    return value;
  }
}

function SnapshotPreviewBody({ raw }: { raw: unknown }) {
  const snapshot = parseRevisionSnapshot(raw);
  if (!snapshot) {
    return (
      <pre className="max-h-80 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-lg bg-secondary p-3 text-xs">
        {JSON.stringify(raw, null, 2)}
      </pre>
    );
  }

  return (
    <div className="space-y-3.5 text-sm tabular-nums">
      <dl className="grid grid-cols-1 divide-y divide-border rounded-lg border border-border bg-canvas/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="px-3 py-2.5">
          <dt className="text-xs text-text-muted">Jenis laporan</dt>
          <dd className="mt-0.5 break-words font-medium text-text-primary">
            {snapshot.reportType === "WORK" ? "Ada Pekerjaan" : "Hari Tanpa Pekerjaan"}
          </dd>
        </div>
        <div className="px-3 py-2.5">
          <dt className="text-xs text-text-muted">Cuaca</dt>
          <dd className="mt-0.5 font-medium text-text-primary">
            {snapshot.weather ? WEATHER_TEXT[snapshot.weather] : "Tidak tercatat"}
          </dd>
        </div>
        <div className="px-3 py-2.5">
          <dt className="text-xs text-text-muted">Pekerja hadir</dt>
          <dd className="mt-0.5 font-medium text-text-primary">
            {snapshot.workerCount !== null ? `${snapshot.workerCount} orang` : "Tidak tercatat"}
          </dd>
        </div>
      </dl>
      {snapshot.reportType === "WORK" ? (
        <dl className="divide-y divide-border rounded-lg border border-border bg-canvas/50 px-3.5">
          <SnapshotField label="Uraian pekerjaan" value={snapshot.progressText} />
          <SnapshotField label="Hambatan / kendala" value={snapshot.obstaclesText} />
          <SnapshotField label="Rencana besok" value={snapshot.tomorrowPlanText} />
          <SnapshotField label="Lokasi" value={snapshot.locationText} />
        </dl>
      ) : (
        <dl className="rounded-lg border border-border bg-canvas/50 px-3.5 py-2.5">
          <SnapshotField label="Alasan tidak ada pekerjaan" value={snapshot.noWorkReason} />
        </dl>
      )}
      <p className="break-words text-xs text-text-muted">
        Dokumentasi: <strong className="text-text-secondary">{snapshot.photos.length} foto</strong>
        {snapshot.signedByName && (
          <> · Paraf: <strong className="text-text-secondary">{snapshot.signedByName}</strong></>
        )}
      </p>
    </div>
  );
}

function SnapshotField({ label, value }: { label: string; value: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div className="py-2.5 first:pt-3">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="mt-1 break-words whitespace-pre-wrap text-sm text-text-primary">{value}</dd>
    </div>
  );
}

export function ReportRevisionHistory({
  revisions,
  timeZone,
}: {
  revisions: DailyReportRevisionDto[];
  timeZone: string;
}) {
  const [selectedRevision, setSelectedRevision] = useState<DailyReportRevisionDto | null>(null);
  if (revisions.length === 0) return null;

  return (
    <>
      <Card className="gap-0 overflow-hidden rounded-[1rem] border-[#ead9cc] bg-[#fffdfb] py-0 shadow-none ring-0">
        <CardContent className="p-0">
          <Accordion defaultValue={["report-revisions"]} multiple>
            <AccordionItem value="report-revisions" className="border-0">
              <AccordionTrigger className="min-h-10 items-center gap-3 rounded-none bg-[#f6e8df] px-3.5 py-2 text-left text-sm font-bold text-[#9c471d] hover:no-underline">
                Riwayat perubahan
                <span className="ml-auto shrink-0 text-xs font-medium text-[#6b605c]">
                  {revisions.length}
                </span>
              </AccordionTrigger>
              <AccordionContent className="bg-[#fffdfb] px-3.5">
                <ol className="divide-y divide-[#ead9cc] border-t border-[#ead9cc]">
                  {revisions.map((revision) => (
                    <li key={revision.id} className="space-y-1.5 py-2.5 first:pt-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <Badge className="h-auto shrink-0 rounded-md border-0 bg-[#f6e8df] px-2 py-0.5 text-xs font-semibold text-[#7e3517] hover:bg-[#f6e8df]">
                          Revisi {revision.revisionNo}
                        </Badge>
                        <span className="text-xs text-[#9c471d]" aria-hidden="true">•</span>
                        <time
                          dateTime={revision.createdAt}
                          className="break-words text-xs leading-4 text-[#1d1c1b]"
                        >
                          {formatRevisionTime(revision.createdAt, timeZone)}
                        </time>
                      </div>
                      <p className="break-words whitespace-pre-wrap text-sm leading-5 text-[#1d1c1b]">
                        {revision.changeSummary || "Ringkasan perubahan tidak tersedia."}
                      </p>
                      <p className="break-words text-[11px] leading-4 text-[#6b605c]">
                        Diubah oleh {revision.revisedByName}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRevision(revision)}
                        className="min-h-10 max-w-full whitespace-normal border-[#ead9cc] px-3 text-xs text-[#6b605c]"
                      >
                        Lihat versi sebelum revisi
                      </Button>
                    </li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedRevision)} onOpenChange={(open) => !open && setSelectedRevision(null)}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Snapshot sebelum revisi #{selectedRevision?.revisionNo}</DialogTitle>
          </DialogHeader>
          {selectedRevision && <SnapshotPreviewBody raw={selectedRevision.previousSnapshotJson} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
