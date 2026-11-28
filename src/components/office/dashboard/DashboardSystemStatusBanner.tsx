import { formatCurrencyIdr } from "@/lib/validation/payment.validation";
import type { DashboardSystemOverview } from "@/types/api/dashboard.types";

export function countDashboardSystemAlerts(overview?: DashboardSystemOverview): number {
  if (!overview) return 0;
  return (
    overview.projects.withoutSiteManager +
    overview.team.unassignedAreasCount +
    overview.team.areasWithInactiveSupervisorCount +
    (overview.payments?.overdueUnpaidCount ?? 0)
  );
}

export function DashboardSystemStatusBanner({
  overview,
  alertCount,
  onOpenSystemTab,
}: {
  overview: DashboardSystemOverview;
  alertCount: number;
  onOpenSystemTab: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-xl border border-border bg-surface px-4 py-3 text-xs text-text-secondary tabular-nums">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <span>
          Tim aktif:{" "}
          <strong className="font-semibold text-text-primary">{overview.team.totalActive} akun</strong>
        </span>
        <span>
          Aktivitas {overview.recentActivity.days} hari:{" "}
          <strong className="font-semibold text-text-primary">
            {overview.recentActivity.commsInCount + overview.recentActivity.commsOutCount} comms
          </strong>{" "}
          · <strong className="font-semibold text-text-primary">{overview.recentActivity.drawingsCount} drawing</strong>
        </span>
        {overview.payments && (
          <span>
            Tagihan HR belum lunas:{" "}
            <strong
              className={`font-semibold ${
                overview.payments.overdueUnpaidCount > 0
                  ? "text-status-danger-fg"
                  : overview.payments.unpaidCount > 0
                    ? "text-status-warning-fg"
                    : "text-text-primary"
              }`}
            >
              {formatCurrencyIdr(overview.payments.totalUnpaidAmount)} ({overview.payments.unpaidCount})
            </strong>
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onOpenSystemTab}
        className="inline-flex min-h-10 items-center text-xs font-medium text-text-primary underline-offset-4 hover:underline sm:min-h-0"
      >
        {alertCount > 0 ? `${alertCount} perhatian sistem` : "Lihat ringkasan sistem"}
      </button>
    </div>
  );
}
