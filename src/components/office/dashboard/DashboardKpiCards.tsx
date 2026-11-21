import { AlertTriangle, Briefcase, CheckCircle2, Layers } from "lucide-react";
import type { DashboardKpiMetrics } from "@/types/api/dashboard.types";

interface DashboardKpiCardsProps {
  metrics: DashboardKpiMetrics;
}

export function DashboardKpiCards({ metrics }: DashboardKpiCardsProps) {
  const hasOverdue = metrics.areasOverdueMoreThan3Days > 0;
  const items = [
    {
      label: "Proyek Aktif",
      value: metrics.totalProjects,
      desc: "Proyek konstruksi berjalan",
      icon: Briefcase,
      iconTone: "text-text-secondary border-border/80 bg-surface",
    },
    {
      label: "Area Terpantau",
      value: metrics.activeAreas,
      desc: "Total area penugasan",
      icon: Layers,
      iconTone: "text-status-info-fg border-status-info-fg/20 bg-status-info-bg/60",
    },
    {
      label: "Laporan Masuk Hari Ini",
      value: metrics.reportsSubmittedToday,
      desc: "Laporan harian terkirim",
      icon: CheckCircle2,
      iconTone: "text-status-success-fg border-status-success-fg/20 bg-status-success-bg/60",
    },
    {
      label: "Area Tertunggak > 3 Hari",
      value: metrics.areasOverdueMoreThan3Days,
      desc: "Perlu perhatian manajemen",
      icon: AlertTriangle,
      iconTone: hasOverdue
        ? "text-status-danger-fg border-status-danger-fg/25 bg-status-danger-bg/70"
        : "text-text-muted border-border/80 bg-surface",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-normal text-text-secondary">{item.label}</p>
              <p className="mt-2 font-heading text-[28px] leading-none font-semibold tracking-tight tabular-nums text-text-primary">
                {item.value}
              </p>
              <p className="mt-1.5 truncate text-[11px] text-text-muted">{item.desc}</p>
            </div>
            <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-surface-input">
              <div
                className={`flex size-9 items-center justify-center rounded-md border ${item.iconTone}`}
              >
                <Icon className="size-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
