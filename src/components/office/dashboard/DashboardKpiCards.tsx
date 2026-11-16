import { AlertTriangle, Briefcase, CheckCircle2, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      icon: Briefcase,
      color: "text-brand-primary bg-brand-primary/10",
    },
    {
      label: "Area Terpantau",
      value: metrics.activeAreas,
      desc: "Total area penugasan",
      icon: Layers,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Laporan Masuk Hari Ini",
      value: metrics.reportsSubmittedToday,
      desc: "Laporan harian terkirim",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Area Tertunggak > 3 Hari",
      value: metrics.areasOverdueMoreThan3Days,
      desc: "Perlu perhatian manajemen",
      icon: AlertTriangle,
      color: metrics.areasOverdueMoreThan3Days > 0 ? "text-rose-600 bg-rose-50" : "text-slate-600 bg-slate-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border-border shadow-xs">
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-text-secondary">{item.label}</p>
                <p className="text-2xl font-bold tracking-tight text-text-primary">{item.value}</p>
                <p className="text-[11px] text-text-muted">{item.desc}</p>
              </div>
              <div className={`rounded-xl p-2.5 ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
