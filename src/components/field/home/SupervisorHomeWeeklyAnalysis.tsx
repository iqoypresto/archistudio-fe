import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type WeeklyCounts = {
  completed: number | null;
  late: number | null;
  overdue: number | null;
};

const metrics = [
  {
    key: "completed",
    label: "Selesai",
    icon: CheckCircle2,
    tone: "text-status-success-fg",
  },
  {
    key: "late",
    label: "Terlambat",
    icon: Clock3,
    tone: "text-status-warning-fg",
  },
  {
    key: "overdue",
    label: "Tertunggak",
    icon: AlertCircle,
    tone: "text-status-danger-fg",
  },
] as const;

export function SupervisorHomeWeeklyAnalysis({
  counts,
  weekLabel,
  loading,
  error,
  onRetry,
}: {
  counts: WeeklyCounts;
  weekLabel: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  return (
    <section aria-labelledby="weekly-analysis-title" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="weekly-analysis-title" className="text-lg font-bold text-[var(--project-text-heading)]">
          Analisis Mingguan
        </h2>
        <p className="shrink-0 text-xs text-[var(--project-text-secondary)]">{weekLabel}</p>
      </div>

      <div className="grid grid-cols-3 gap-2" aria-busy={loading || undefined}>
        {loading
          ? metrics.map((metric) => <Skeleton key={metric.key} className="h-20 rounded-2xl" />)
          : metrics.map((metric) => {
            const Icon = metric.icon;
            const value = counts[metric.key];
            return (
              <Card key={metric.key} className={`min-w-0 rounded-2xl border border-[var(--project-border)] bg-white py-0 shadow-none ${metric.tone}`}>
                <CardContent className="flex min-h-20 flex-col justify-between p-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <h3 className="text-xs font-semibold leading-tight">{metric.label}</h3>
                  </div>
                  <p className="w-full text-center text-2xl font-bold leading-none tabular-nums" aria-label={`${metric.label}: ${value ?? "data tidak tersedia"}`}>
                    {value ?? "—"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {error && !loading && (
        <div className="flex items-center justify-between gap-3 text-sm text-text-secondary" role="status">
          <span>Data analisis belum dapat dimuat.</span>
          <Button type="button" variant="ghost" onClick={onRetry} className="min-h-10 px-2 text-primary">
            Coba lagi
          </Button>
        </div>
      )}
    </section>
  );
}
