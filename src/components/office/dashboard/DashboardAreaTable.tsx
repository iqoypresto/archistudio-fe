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
    <div className="overflow-hidden rounded-xl border border-border bg-surface-primary shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-secondary/50">
            <TableHead className="w-1/4">Area & Proyek</TableHead>
            <TableHead className="w-1/5">Supervisor Aktif</TableHead>
            <TableHead className="w-1/5">Status Tanggal Ini</TableHead>
            <TableHead className="w-1/5">Kunci & Tunggakan</TableHead>
            <TableHead className="w-1/6 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {areas.map((area) => {
            const { tone, label } = resolveStatusTone(area.status);
            return (
              <TableRow key={area.areaId} className="hover:bg-surface-secondary/30">
                <TableCell>
                  <p className="font-semibold text-text-primary">
                    [{area.areaCode}] {area.areaName}
                  </p>
                  <p className="text-xs text-text-secondary">
                    [{area.projectCode}] {area.projectName}
                  </p>
                </TableCell>
                <TableCell>
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
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Tertunggak {area.overdueBusinessDaysCount} Hari</span>
                    </div>
                  ) : area.overdueBusinessDaysCount > 0 ? (
                    <span className="text-xs text-amber-600">
                      Tertunggak {area.overdueBusinessDaysCount} hari
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-600">Tidak ada tunggakan</span>
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
                        className="min-h-11 gap-1.5 border-rose-300 px-3 text-rose-700 hover:bg-rose-50"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        Buka Kunci
                      </Button>
                    )}
                    {area.reportId ? (
                      <Link
                        href={`/reports/${area.reportId}`}
                        className="inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-xs font-medium text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
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
