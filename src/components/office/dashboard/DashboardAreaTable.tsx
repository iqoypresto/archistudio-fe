import Link from "next/link";
import { AlertTriangle, ExternalLink, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AreaDailyStatusType, DashboardAreaStatusItem } from "@/types/api/dashboard.types";

interface DashboardAreaTableProps {
  areas: DashboardAreaStatusItem[];
  onOpenUnlockModal: (area: DashboardAreaStatusItem) => void;
}

function resolveStatusTone(status: AreaDailyStatusType): { tone: StatusTone; label: string } {
  if (status === "TERKIRIM") return { tone: "success", label: "Terkirim (Tepat Waktu)" };
  if (status === "TERLAMBAT") return { tone: "warning", label: "Terkirim (Terlambat)" };
  if (status === "BELUM_LAPOR") return { tone: "danger", label: "Belum Lapor" };
  return { tone: "muted", label: "Libur Rutin" };
}

export function DashboardAreaTable({ areas, onOpenUnlockModal }: DashboardAreaTableProps) {
  if (areas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-secondary">
        Tidak ada area yang cocok dengan filter yang dipilih.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <Table>
        <TableHeader className="bg-surface-input/70">
          <TableRow className="border-border/80 hover:bg-transparent">
            <TableHead className="h-10 w-1/4 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">Area & Proyek</TableHead>
            <TableHead className="h-10 w-1/5 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">Supervisor Aktif</TableHead>
            <TableHead className="h-10 w-1/5 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">Status Hari Ini</TableHead>
            <TableHead className="h-10 w-1/5 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">Kunci & Tunggakan</TableHead>
            <TableHead className="h-10 w-1/6 px-4 text-center text-[11px] font-medium tracking-wider text-text-muted uppercase">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {areas.map((area) => {
            const { tone, label } = resolveStatusTone(area.status);
            return (
              <TableRow key={area.areaId} className="border-border/60 hover:bg-surface-input/40">
                <TableCell className="px-4 py-3">
                  <p className="font-medium text-text-primary">
                    [{area.areaCode}] {area.areaName}
                  </p>
                  <p className="text-xs text-text-secondary">
                    [{area.projectCode}] {area.projectName}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3">
                  {area.supervisor ? (
                    <div>
                      <p className="text-xs font-medium text-text-primary">{area.supervisor.name}</p>
                      <p className="text-[11px] text-text-muted">{area.supervisor.jobTitle}</p>
                    </div>
                  ) : (
                    <span className="text-xs italic text-text-muted">Belum ada penugasan</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={tone}>{label}</StatusBadge>
                  {area.reportNumber && (
                    <p className="mt-1 font-mono text-[10px] text-text-muted">{area.reportNumber}</p>
                  )}
                </TableCell>
                <TableCell>
                  {area.isOverdueMoreThan3Days ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-status-danger-fg">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Tertunggak {area.overdueBusinessDaysCount} Hari</span>
                    </div>
                  ) : area.overdueBusinessDaysCount > 0 ? (
                    <span className="text-xs text-status-warning-fg">
                      Tertunggak {area.overdueBusinessDaysCount} hari
                    </span>
                  ) : (
                    <span className="text-xs text-status-success-fg">Tidak ada tunggakan</span>
                  )}
                  {area.latestUnlock && (
                    <p className="mt-1 text-[11px] text-text-muted">
                      Dibuka hingga {area.latestUnlock.unlockedThroughDate}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {area.isOverdueMoreThan3Days && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenUnlockModal(area)}
                        className="h-8 gap-1.5 border-status-danger-fg/30 bg-status-danger-bg/60 px-2.5 text-xs text-status-danger-fg hover:bg-status-danger-bg"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        Buka Kunci
                      </Button>
                    )}
                    {area.reportId ? (
                      <Link
                        href={`/reports/${area.reportId}`}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-surface-input px-2.5 text-xs font-medium text-text-secondary hover:bg-surface-active hover:text-text-primary"
                      >
                        Detail
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : null}
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
