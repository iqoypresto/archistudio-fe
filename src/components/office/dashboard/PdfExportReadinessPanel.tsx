import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { useDashboardSummary } from "@/hooks/dashboard.hooks";
import { resolveAreaStatusBadgeTone } from "@/lib/validation/dashboard.validation";
import type { AreaDailyStatusType } from "@/types/api/dashboard.types";

interface PdfExportReadinessPanelProps {
  projectId: string;
  date: string;
}

const SHORT_STATUS: Record<AreaDailyStatusType, string> = {
  TERKIRIM: "Terkirim",
  TERLAMBAT: "Terlambat",
  BELUM_LAPOR: "Belum Lapor",
  LIBUR_RUTIN: "Libur Rutin",
};

export function PdfExportReadinessPanel({ projectId, date }: PdfExportReadinessPanelProps) {
  const ready = Boolean(projectId && date);
  const { data, isLoading } = useDashboardSummary(
    ready ? { projectId, date } : {},
  );

  if (!ready) {
    return (
      <div className="rounded-lg border border-border bg-canvas/60 px-3.5 py-3 text-xs text-text-muted">
        Pilih proyek dan tanggal terlebih dahulu untuk mengecek kelengkapan laporan tiap area.
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="rounded-lg border border-border bg-canvas/60 px-3.5 py-3 text-xs text-text-muted">
        Memeriksa kelengkapan laporan area...
      </div>
    );
  }

  const areas = data?.areas ?? [];
  const required = areas.filter((a) => a.status !== "LIBUR_RUTIN");
  const submitted = required.filter(
    (a) => a.status === "TERKIRIM" || a.status === "TERLAMBAT",
  );
  const missing = required.filter((a) => a.status === "BELUM_LAPOR");

  return (
    <div className="space-y-2 rounded-lg border border-border bg-canvas/60 p-3 tabular-nums">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-text-primary">Kelengkapan Area</span>
        <span
          className={
            missing.length > 0 ? "text-status-warning-fg" : "text-status-success-fg"
          }
        >
          {submitted.length} / {required.length} area terkirim
        </span>
      </div>

      {areas.length === 0 ? (
        <p className="text-xs text-text-muted">Belum ada area aktif terdaftar pada proyek ini.</p>
      ) : (
        <ul className="max-h-32 divide-y divide-border/60 overflow-y-auto text-xs">
          {areas.map((area) => (
            <li key={area.areaId} className="flex items-center justify-between gap-2 py-1.5">
              <span className="truncate text-text-secondary">
                <span className="text-text-muted">{area.areaCode}</span> {area.areaName}
              </span>
              <StatusIndicator
                tone={resolveAreaStatusBadgeTone(area.status)}
                className="shrink-0 text-[11px]"
              >
                {SHORT_STATUS[area.status]}
              </StatusIndicator>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
