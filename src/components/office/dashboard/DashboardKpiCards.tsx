import type { DashboardKpiMetrics } from "@/types/api/dashboard.types";

interface DashboardKpiCardsProps {
  metrics: DashboardKpiMetrics;
}

export function DashboardKpiCards({ metrics }: DashboardKpiCardsProps) {
  const items = [
    {
      label: "Proyek Aktif",
      value: metrics.totalProjects,
      desc: "Proyek konstruksi berjalan",
    },
    {
      label: "Area Terpantau",
      value: metrics.activeAreas,
      desc: "Total area penugasan",
    },
    {
      label: "Laporan Masuk Hari Ini",
      value: metrics.reportsSubmittedToday,
      desc: "Laporan harian terkirim",
    },
    {
      label: "Area Tertunggak > 3 Hari",
      value: metrics.areasOverdueMoreThan3Days,
      desc: "Perlu perhatian manajemen",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-surface p-4"
        >
          <p className="truncate text-xs font-normal text-text-secondary">{item.label}</p>
          <p className="mt-2 font-heading text-[28px] leading-none font-semibold tracking-tight tabular-nums text-text-primary">
            {item.value}
          </p>
          <p className="mt-1.5 truncate text-[11px] text-text-muted">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
