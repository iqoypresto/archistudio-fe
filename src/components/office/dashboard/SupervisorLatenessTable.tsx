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
    <div className="overflow-hidden rounded-xl border border-border bg-surface-primary shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-secondary/50">
            <TableHead className="w-1/3">Nama Supervisor</TableHead>
            <TableHead className="w-1/6 text-center">Total Laporan</TableHead>
            <TableHead className="w-1/6 text-center">Tepat Waktu</TableHead>
            <TableHead className="w-1/6 text-center">Terlambat (&gt; 17:00)</TableHead>
            <TableHead className="w-1/5 text-right">Persentase Ketepatan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((spv) => {
            const { tone, label } = resolveRateTone(spv.onTimePercentage);
            return (
              <TableRow key={spv.supervisorId} className="hover:bg-surface-secondary/30">
                <TableCell>
                  <p className="font-semibold text-text-primary">{spv.supervisorName}</p>
                  <p className="text-xs text-text-muted">@{spv.supervisorUsername}</p>
                </TableCell>
                <TableCell className="text-center font-medium">{spv.totalReports}</TableCell>
                <TableCell className="text-center text-emerald-600 font-medium">
                  {spv.onTimeCount}
                </TableCell>
                <TableCell className="text-center text-amber-600 font-medium">
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
