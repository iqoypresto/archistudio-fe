import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { formatIdDate, formatTimeInTimezone } from "@/lib/utils/office-format";
import { getRoleLabel } from "@/lib/utils/role";
import { resolveAreaStatusBadgeTone } from "@/lib/validation/dashboard.validation";
import type { AreaDailyStatusType, DashboardAreaStatusItem } from "@/types/api/dashboard.types";

export function DashboardAreaMobileList({
  areas,
  statusLabels,
  onOpenUnlockModal,
}: {
  areas: DashboardAreaStatusItem[];
  statusLabels: Record<AreaDailyStatusType, string>;
  onOpenUnlockModal: (area: DashboardAreaStatusItem) => void;
}) {
  return (
    <div className="divide-y divide-border/70 md:hidden">
      {areas.map((area) => {
        const tone = resolveAreaStatusBadgeTone(area.status);
        const sentTime = formatTimeInTimezone(area.submittedAt, area.projectTimezone);
        const canUnlock = area.isOverdueMoreThan3Days && Boolean(area.supervisor);

        return (
          <div key={area.areaId} className="space-y-2.5 p-4 tabular-nums">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-text-primary">
                  <span className="text-text-muted">{area.areaCode}</span> {area.areaName}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-secondary">
                  {area.projectCode} · {area.projectName}
                </p>
              </div>
              <StatusIndicator tone={tone} className="shrink-0 text-xs">
                {statusLabels[area.status]}
              </StatusIndicator>
            </div>

            <div className="space-y-0.5 text-xs">
              {area.supervisor ? (
                <p className="text-text-secondary">
                  <span className="font-medium text-text-primary">{area.supervisor.name}</span> ·{" "}
                  {area.supervisor.role
                    ? `${getRoleLabel(area.supervisor.role)} · ${area.supervisor.jobTitle}`
                    : area.supervisor.jobTitle}
                </p>
              ) : (
                <p className="text-status-warning-fg">Supervisor belum ditugaskan</p>
              )}
              {area.supervisor?.isActive === false && (
                <p className="text-[11px] font-medium text-status-danger-fg">
                  Akun pengawas nonaktif · perlu diganti
                </p>
              )}
              {(sentTime || area.reportNumber) && (
                <p className="text-text-muted">
                  {[sentTime, area.reportNumber].filter(Boolean).join(" · ")}
                </p>
              )}
              {area.isOverdueMoreThan3Days ? (
                <p className="font-medium text-status-danger-fg">
                  Terkunci · {area.overdueBusinessDaysCount} hari kerja
                  {area.oldestOverdueDate ? ` (tertua ${formatIdDate(area.oldestOverdueDate)})` : ""}
                </p>
              ) : area.overdueBusinessDaysCount > 0 ? (
                <p className="text-status-warning-fg">
                  Tertunggak {area.overdueBusinessDaysCount} hari
                  {area.oldestOverdueDate ? ` (tertua ${formatIdDate(area.oldestOverdueDate)})` : ""}
                </p>
              ) : null}
              {area.latestUnlock && (
                <p className="text-text-secondary">
                  Dibuka s.d. {formatIdDate(area.latestUnlock.unlockedThroughDate)}
                </p>
              )}
            </div>

            {(canUnlock || area.reportId) && (
              <div className="flex items-center gap-2 pt-0.5">
                {canUnlock && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => onOpenUnlockModal(area)}
                    className="h-10 flex-1 gap-1.5 text-xs"
                  >
                    <KeyRound className="size-3.5" />
                    Buka Kunci
                  </Button>
                )}
                {area.reportId && (
                  <Link
                    href={`/office/reports/${area.reportId}`}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-input px-3 text-xs font-medium text-text-primary transition-colors hover:bg-surface-active"
                  >
                    Lihat Detail
                    <ArrowRight className="size-3.5" />
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
