import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SupervisorLatenessItem } from "@/types/api/dashboard.types";

interface SupervisorLatenessTableProps {
  items: SupervisorLatenessItem[];
}

function resolveRateTone(percentage: number): { tone: StatusTone; label: string } {
  if (percentage >= 80) return { tone: "success", label: `${percentage}% (Disiplin)` };
  if (percentage >= 60) return { tone: "warning", label: `${percentage}% (Cukup)` };
  return { tone: "danger", label: `${percentage}% (Perlu Perhatian)` };
}

export function SupervisorLatenessTable({ items }: SupervisorLatenessTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-secondary">
        Belum ada laporan terkirim untuk rekapitulasi keterlambatan.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <Table>
        <TableHeader className="bg-surface-input/70">
          <TableRow className="border-border/80 hover:bg-transparent">
            <TableHead className="h-10 w-1/3 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">Nama Supervisor</TableHead>
            <TableHead className="h-10 w-1/6 px-4 text-center text-[11px] font-medium tracking-wider text-text-muted uppercase">Total Laporan</TableHead>
            <TableHead className="h-10 w-1/6 px-4 text-center text-[11px] font-medium tracking-wider text-text-muted uppercase">Tepat Waktu</TableHead>
            <TableHead className="h-10 w-1/6 px-4 text-center text-[11px] font-medium tracking-wider text-text-muted uppercase">Terlambat (&gt; 17:00)</TableHead>
            <TableHead className="h-10 w-1/5 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">Persentase Ketepatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((spv) => {
            const { tone, label } = resolveRateTone(spv.onTimePercentage);
            return (
              <TableRow key={spv.supervisorId} className="border-border/60 hover:bg-surface-input/40">
                <TableCell className="px-4 py-3">
                  <p className="font-medium text-text-primary">{spv.supervisorName}</p>
                  <p className="text-xs text-text-muted">@{spv.supervisorUsername}</p>
                </TableCell>
                <TableCell className="text-center font-medium tabular-nums">{spv.totalReports}</TableCell>
                <TableCell className="text-center font-medium tabular-nums text-status-success-fg">
                  {spv.onTimeCount}
                </TableCell>
                <TableCell className="text-center font-medium tabular-nums text-status-warning-fg">
                  {spv.lateCount}
                </TableCell>
                <TableCell className="text-right">
                  <StatusBadge tone={tone}>{label}</StatusBadge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
