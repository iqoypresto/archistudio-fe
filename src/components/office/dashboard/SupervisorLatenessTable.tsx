import { StatusIndicator } from "@/components/ui/StatusIndicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { getRoleLabel } from "@/lib/utils/role";
import type { SupervisorLatenessItem } from "@/types/api/dashboard.types";

interface SupervisorLatenessTableProps {
  items: SupervisorLatenessItem[];
}

function resolveTier(percentage: number): { tone: StatusTone; label: string } {
  if (percentage >= 80) return { tone: "success", label: "Disiplin" };
  if (percentage >= 60) return { tone: "warning", label: "Cukup" };
  return { tone: "danger", label: "Perlu Perhatian" };
}

export function SupervisorLatenessTable({ items }: SupervisorLatenessTableProps) {
  if (items.length === 0) {
    return (
      <div className="border-t border-border px-4 py-10 text-center text-sm text-text-secondary">
        Belum ada data kedisiplinan supervisor pada periode dan filter ini.
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => a.onTimePercentage - b.onTimePercentage);
  const totalSubmitted = items.reduce((acc, item) => acc + item.totalReports, 0);
  const avgRate = Math.round(
    items.reduce((acc, item) => acc + item.onTimePercentage, 0) / items.length,
  );
  const needsAttentionCount = items.filter((item) => item.onTimePercentage < 60).length;

  return (
    <div className="border-t border-border tabular-nums">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border/80 bg-canvas/40 px-4 py-2.5 text-xs text-text-secondary sm:px-5">
        <span>
          Rata-rata Ketepatan Tim:{" "}
          <strong className="font-semibold text-text-primary">{avgRate}%</strong>
        </span>
        <span>
          Total Terkirim:{" "}
          <strong className="font-semibold text-text-primary">{totalSubmitted} laporan</strong>
        </span>
        <span>
          Perlu Evaluasi (&lt;60%):{" "}
          <strong
            className={`font-semibold ${
              needsAttentionCount > 0 ? "text-status-danger-fg" : "text-text-primary"
            }`}
          >
            {needsAttentionCount} supervisor
          </strong>
        </span>
      </div>

      <div className="divide-y divide-border/70 md:hidden">
        {sorted.map((spv) => {
          const { tone, label } = resolveTier(spv.onTimePercentage);
          return (
            <div key={spv.supervisorId} className="space-y-2.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-text-primary">{spv.supervisorName}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    @{spv.supervisorUsername}
                    {spv.supervisorRole ? ` · ${getRoleLabel(spv.supervisorRole)}` : ""}
                  </p>
                </div>
                <StatusIndicator tone={tone} className="shrink-0 text-xs">{label}</StatusIndicator>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/70 bg-canvas/50 p-2.5 text-center text-xs">
                <div>
                  <p className="text-[11px] text-text-muted">Total</p>
                  <p className="mt-0.5 font-semibold text-text-primary">{spv.totalReports}</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted">Tepat</p>
                  <p className="mt-0.5 font-semibold text-status-success-fg">{spv.onTimeCount}</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted">Terlambat</p>
                  <p className="mt-0.5 font-semibold text-status-warning-fg">{spv.lateCount}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Tingkat Ketepatan</span>
                  <span className="font-semibold text-text-primary">{spv.onTimePercentage}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${tone === "danger" ? "bg-status-danger-fg/80" : "bg-text-primary/55"}`}
                    style={{ width: `${Math.min(Math.max(spv.onTimePercentage, 0), 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block">
        <Table>
        <TableHeader className="bg-surface-input/50">
          <TableRow className="border-border/80 hover:bg-transparent">
            <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Supervisor
            </TableHead>
            <TableHead className="h-10 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Total
            </TableHead>
            <TableHead className="h-10 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Tepat Waktu
            </TableHead>
            <TableHead className="h-10 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Terlambat (&gt;17:00)
            </TableHead>
            <TableHead className="h-10 w-64 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Tingkat Ketepatan
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((spv) => {
            const { tone, label } = resolveTier(spv.onTimePercentage);
            return (
              <TableRow
                key={spv.supervisorId}
                className="border-border/60 hover:bg-surface-input/40"
              >
                <TableCell className="px-4 py-3">
                  <p className="text-[13px] font-medium text-text-primary">{spv.supervisorName}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    @{spv.supervisorUsername}
                    {spv.supervisorRole ? ` · ${getRoleLabel(spv.supervisorRole)}` : ""}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">
                  {spv.totalReports}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-[13px] font-medium text-status-success-fg">
                  {spv.onTimeCount}
                </TableCell>
                <TableCell className="px-4 py-3 text-right text-[13px] font-medium text-status-warning-fg">
                  {spv.lateCount}
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <div className="ml-auto flex max-w-56 flex-col items-end gap-1.5">
                    <div className="flex w-full items-center justify-between gap-3">
                      <StatusIndicator tone={tone} className="text-xs">
                        {label}
                      </StatusIndicator>
                      <span className="text-xs font-semibold text-text-primary">
                        {spv.onTimePercentage}%
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${
                          tone === "danger"
                            ? "bg-status-danger-fg/80"
                            : "bg-text-primary/55"
                        }`}
                        style={{ width: `${Math.min(Math.max(spv.onTimePercentage, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
