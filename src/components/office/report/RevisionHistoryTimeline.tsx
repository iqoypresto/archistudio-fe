"use client";

import { useState } from "react";
import { Eye, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { parseRevisionSnapshot } from "@/lib/validation/report-revision.validation";
import type { DailyReportRevisionDto } from "@/types/api/report.types";

function SnapshotPreviewBody({ raw }: { raw: unknown }) {
  const snapshot = parseRevisionSnapshot(raw);
  if (!snapshot) {
    return (
      <pre className="max-h-80 overflow-auto rounded-lg bg-secondary p-3 font-mono text-xs">
        {JSON.stringify(raw, null, 2)}
      </pre>
    );
  }
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="muted">
          Tipe: {snapshot.reportType === "WORK" ? "Ada Pekerjaan" : "Tanpa Pekerjaan"}
        </StatusBadge>
        {snapshot.weather && <StatusBadge tone="info">Cuaca: {snapshot.weather}</StatusBadge>}
        {snapshot.workerCount !== null && (
          <StatusBadge tone="muted">Pekerja: {snapshot.workerCount}</StatusBadge>
        )}
      </div>
      {snapshot.reportType === "WORK" ? (
        <div className="space-y-2 rounded-lg border border-border bg-canvas p-3">
          <p><strong>Progres:</strong> {snapshot.progressText ?? "-"}</p>
          <p><strong>Hambatan:</strong> {snapshot.obstaclesText ?? "-"}</p>
          <p><strong>Rencana Besok:</strong> {snapshot.tomorrowPlanText ?? "-"}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-canvas p-3">
          <p><strong>Alasan Tanpa Kerja:</strong> {snapshot.noWorkReason ?? "-"}</p>
        </div>
      )}
      <p className="text-xs text-text-secondary">
        Jumlah foto pada versi ini: <strong>{snapshot.photos.length}</strong> • Paraf:{" "}
        {snapshot.signedByName ?? "-"}
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
      <Card className="border border-border bg-surface">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <History className="size-4 text-text-secondary" />
            Riwayat Revisi Owner ({revisions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {revisions.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col gap-2 rounded-xl border border-border/80 bg-surface-input/70 p-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone="info">Revisi #{rev.revisionNo}</StatusBadge>
                  <span className="font-medium text-text-primary">{rev.revisedByName}</span>
                  <span className="font-mono text-xs text-text-muted">
                    {new Intl.DateTimeFormat("id-ID", {
                      timeZone,
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(rev.createdAt))}
                  </span>
                </div>
                <p className="text-text-secondary">{rev.changeSummary}</p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedRev(rev)}
                className="h-8 shrink-0 gap-1.5 text-xs"
              >
                <Eye className="size-3.5" />
                Lihat Versi Sebelumnya
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedRev)} onOpenChange={(o) => !o && setSelectedRev(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Snapshot Sebelum Revisi #{selectedRev?.revisionNo}
            </DialogTitle>
          </DialogHeader>
          {selectedRev && <SnapshotPreviewBody raw={selectedRev.previousSnapshotJson} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
