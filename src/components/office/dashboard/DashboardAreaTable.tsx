import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatIdDate, formatTimeInTimezone } from "@/lib/utils/office-format";
import { getRoleLabel } from "@/lib/utils/role";
import { resolveAreaStatusBadgeTone } from "@/lib/validation/dashboard.validation";
import type { AreaDailyStatusType, DashboardAreaStatusItem } from "@/types/api/dashboard.types";

interface DashboardAreaTableProps {
  areas: DashboardAreaStatusItem[];
  onOpenUnlockModal: (area: DashboardAreaStatusItem) => void;
}

const STATUS_LABEL: Record<AreaDailyStatusType, string> = {
  TERKIRIM: "Tepat Waktu",
  TERLAMBAT: "Diunggah Terlambat",
  BELUM_LAPOR: "Belum Lapor",
  LIBUR_RUTIN: "Libur Rutin",
  BELUM_DITUGASKAN: "Belum Ditugaskan",
  DI_LUAR_JADWAL: "Di Luar Jadwal",
};

const STATUS_PRIORITY: Record<AreaDailyStatusType, number> = {
  BELUM_LAPOR: 1,
  TERLAMBAT: 2,
  BELUM_DITUGASKAN: 3,
  TERKIRIM: 4,
  LIBUR_RUTIN: 5,
  DI_LUAR_JADWAL: 6,
};

function sortAreas(items: DashboardAreaStatusItem[]): DashboardAreaStatusItem[] {
  return [...items].sort((a, b) => {
    if (a.isOverdueMoreThan3Days !== b.isOverdueMoreThan3Days) {
      return a.isOverdueMoreThan3Days ? -1 : 1;
    }
    const statusDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (statusDiff !== 0) return statusDiff;
    return b.overdueBusinessDaysCount - a.overdueBusinessDaysCount;
  });
}

export function DashboardAreaTable({ areas, onOpenUnlockModal }: DashboardAreaTableProps) {
  if (areas.length === 0) {
    return (
      <div className="border-t border-border px-4 py-10 text-center text-sm text-text-secondary">
        Tidak ada area yang cocok dengan filter yang dipilih.
      </div>
    );
  }

  const sortedAreas = sortAreas(areas);

  return (
    <div className="border-t border-border">
      <Table className="tabular-nums">
        <TableHeader className="bg-surface-input/50">
          <TableRow className="border-border/80 hover:bg-transparent">
            <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Area &amp; Proyek
            </TableHead>
            <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Supervisor Aktif
            </TableHead>
            <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Status Hari Ini
            </TableHead>
            <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Kunci &amp; Tunggakan
            </TableHead>
            <TableHead className="h-10 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAreas.map((area) => {
            const tone = resolveAreaStatusBadgeTone(area.status);
            const sentTime = formatTimeInTimezone(area.submittedAt, area.projectTimezone);
            return (
              <TableRow key={area.areaId} className="border-border/60 hover:bg-surface-input/40">
                <TableCell className="px-4 py-3">
                  <p className="text-[13px] font-medium text-text-primary">
                    <span className="text-text-muted">{area.areaCode}</span> {area.areaName}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {area.projectCode} · {area.projectName}
                  </p>
                </TableCell>
                <TableCell className="px-4 py-3">
                  {area.supervisor ? (
                    <>
                      <p className="text-[13px] font-medium text-text-primary">
                        {area.supervisor.name}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {area.supervisor.role
                          ? `${getRoleLabel(area.supervisor.role)} · ${area.supervisor.jobTitle}`
                          : area.supervisor.jobTitle}
                      </p>
                      {area.supervisor.isActive === false && (
                        <p className="mt-0.5 text-[11px] font-medium text-status-danger-fg">
                          Akun nonaktif · perlu diganti
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-status-warning-fg">Belum ditugaskan</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <StatusIndicator tone={tone}>{STATUS_LABEL[area.status]}</StatusIndicator>
                  {(sentTime || area.reportNumber) && (
                    <p className="mt-1 text-xs text-text-muted">
                      {[sentTime, area.reportNumber].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3">
                  {area.isOverdueMoreThan3Days ? (
                    <p className="text-[13px] font-medium text-status-danger-fg">
                      Terkunci · {area.overdueBusinessDaysCount} hari kerja
                    </p>
                  ) : area.overdueBusinessDaysCount > 0 ? (
                    <p className="text-[13px] text-status-warning-fg">
                      Tertunggak {area.overdueBusinessDaysCount} hari
                    </p>
                  ) : (
                    <p className="text-[13px] text-text-muted">Normal</p>
                  )}
                  {area.oldestOverdueDate && area.overdueBusinessDaysCount > 0 && (
                    <p className="mt-0.5 text-xs text-text-muted">
                      Tertua {formatIdDate(area.oldestOverdueDate)}
                    </p>
                  )}
                  {area.latestUnlock && (
                    <p className="mt-0.5 text-xs text-text-secondary">
                      Dibuka s.d. {formatIdDate(area.latestUnlock.unlockedThroughDate)}
                    </p>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {area.isOverdueMoreThan3Days && Boolean(area.supervisor) && (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => onOpenUnlockModal(area)}
                        className="h-8 gap-1.5 px-2.5 text-xs"
                      >
                        <KeyRound className="size-3.5" />
                        Buka Kunci
                      </Button>
                    )}
                    {area.reportId && (
                      <Link
                        href={`/office/reports/${area.reportId}`}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-surface-input px-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-active hover:text-text-primary"
                      >
                        Detail
                        <ArrowRight className="size-3" />
                      </Link>
                    )}
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
