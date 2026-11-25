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
                  <p className="mt-0.5 text-xs text-text-muted">@{spv.supervisorUsername}</p>
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
  );
}
