import { ArrowRight } from "lucide-react";
import type { DashboardAreaStatusItem, DashboardKpiMetrics } from "@/types/api/dashboard.types";

interface DashboardKpiCardsProps {
  metrics: DashboardKpiMetrics;
  areas: DashboardAreaStatusItem[];
  onClickOverdue?: () => void;
}

export function DashboardKpiCards({
  metrics,
  areas,
  onClickOverdue,
}: DashboardKpiCardsProps) {
  const onTimeCount = areas.filter((a) => a.status === "TERKIRIM").length;
  const lateCount = areas.filter((a) => a.status === "TERLAMBAT").length;
  const unreportedCount = areas.filter((a) => a.status === "BELUM_LAPOR").length;
  const holidayCount = areas.filter((a) => a.status === "LIBUR_RUTIN").length;
  const requiredToday = Math.max(metrics.activeAreas - holidayCount, 0);
  const progressPct =
    requiredToday > 0
      ? Math.min(Math.round((metrics.reportsSubmittedToday / requiredToday) * 100), 100)
      : 0;
  const hasOverdue = metrics.areasOverdueMoreThan3Days > 0;

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 tabular-nums">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-text-secondary">Proyek Aktif</p>
        <p className="mt-2.5 text-[28px] leading-none font-semibold tracking-tight text-text-primary">
          {metrics.totalProjects}
        </p>
        <p className="mt-2 text-xs text-text-muted">
          {metrics.activeAreas} area aktif terpantau
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-text-secondary">Laporan Masuk</p>
          <span className="text-xs font-medium text-text-secondary">{progressPct}%</span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-[28px] leading-none font-semibold tracking-tight text-text-primary">
            {metrics.reportsSubmittedToday}
          </span>
          <span className="text-sm text-text-muted">/ {requiredToday}</span>
        </div>
        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-text-primary/55 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-text-muted">
          {onTimeCount} tepat waktu · {lateCount} terlambat
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-xs text-text-secondary">Belum Lapor</p>
        <p className="mt-2.5 text-[28px] leading-none font-semibold tracking-tight text-text-primary">
          {unreportedCount}
        </p>
        <p className="mt-2 text-xs text-text-muted">
          {holidayCount > 0 ? `${holidayCount} libur rutin · ` : ""}Batas normal 17:00
        </p>
      </div>

      <div
        className={`rounded-xl border bg-surface p-4 ${
          hasOverdue ? "border-status-danger-fg/30" : "border-border"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-text-secondary">Tertunggak &gt; 3 Hari</p>
          {hasOverdue && onClickOverdue && (
            <button
              type="button"
              onClick={onClickOverdue}
              className="inline-flex items-center gap-1 text-xs font-medium text-status-danger-fg transition-opacity hover:opacity-80"
            >
              Lihat <ArrowRight className="size-3" />
            </button>
          )}
        </div>
        <p
          className={`mt-2.5 text-[28px] leading-none font-semibold tracking-tight ${
            hasOverdue ? "text-status-danger-fg" : "text-text-primary"
          }`}
        >
          {metrics.areasOverdueMoreThan3Days}
        </p>
        <p className="mt-2 text-xs text-text-muted">
          {hasOverdue ? "Area terkunci · perlu buka kunci" : "Tidak ada area terkunci"}
        </p>
      </div>
    </div>
  );
}
