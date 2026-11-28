"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { ProjectFilePreviewDialog } from "@/components/field/project/ProjectFilePreviewDialog";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatIdDate, getTodayInJakarta } from "@/lib/utils/office-format";
import { openProjectFile } from "@/lib/utils/project-file";
import { formatCurrencyIdr } from "@/lib/validation/payment.validation";
import type { PaymentRecordItem } from "@/types/api/payment.types";
import type { ProjectFilePreviewItem } from "@/types/project-file.types";

interface PaymentRecordRowsProps {
  items: PaymentRecordItem[];
  onEditRecord: (record: PaymentRecordItem) => void;
}

function getStatusDisplay(record: PaymentRecordItem, today: string) {
  const isOverdue =
    record.status === "UNPAID" && Boolean(record.dueDate) && (record.dueDate as string) < today;
  const tone = record.status === "PAID" ? "success" : isOverdue ? "danger" : "warning";
  const label =
    record.status === "PAID" ? "Sudah Dibayar" : isOverdue ? "Jatuh Tempo" : "Belum Dibayar";
  return { isOverdue, tone, label } as const;
}

export function PaymentRecordRows({ items, onEditRecord }: PaymentRecordRowsProps) {
  const [previewFile, setPreviewFile] = useState<ProjectFilePreviewItem | null>(null);
  const today = getTodayInJakarta();

  const openProof = (record: PaymentRecordItem) => {
    if (!record.proofContentPath) return;
    openProjectFile(
      {
        id: record.proofStoredFileId ?? record.id,
        fileName: record.proofFileName ?? "Bukti Pembayaran",
        mimeType: record.proofMimeType ?? "image/jpeg",
        sizeBytes: record.proofSizeBytes ?? 0,
        uploadedAt: record.recordDate,
        contentPath: record.proofContentPath,
      },
      setPreviewFile,
    );
  };

  return (
    <div className="border-t border-border">
      <div className="divide-y divide-border/70 md:hidden">
        {items.map((record) => {
          const { isOverdue, tone, label } = getStatusDisplay(record, today);
          return (
            <div key={record.id} className="space-y-2.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-text-primary">{formatCurrencyIdr(record.amount)}</p>
                <StatusIndicator tone={tone} className="shrink-0 text-xs">{label}</StatusIndicator>
              </div>
              <div className="space-y-0.5 text-xs">
                <p className="text-text-secondary">Tanggal: {formatIdDate(record.recordDate)}</p>
                <p className={isOverdue ? "font-medium text-status-danger-fg" : "text-text-muted"}>
                  {record.dueDate
                    ? `${isOverdue ? "Melewati jatuh tempo" : "Jatuh tempo"} ${formatIdDate(record.dueDate)}`
                    : "Tanpa jatuh tempo"}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                {record.proofContentPath && (
                  <button
                    type="button"
                    onClick={() => openProof(record)}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-input px-3 text-xs font-medium text-text-primary transition-colors hover:bg-surface-active"
                  >
                    <Eye className="size-3.5" />
                    Lihat Bukti
                  </button>
                )}
                <Button type="button" variant="outline" size="sm" className="h-10 flex-1 text-xs text-text-primary" onClick={() => onEditRecord(record)}>
                  Ubah Catatan
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-surface-input/50">
            <TableRow className="border-border/80 hover:bg-transparent">
              <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">Nominal</TableHead>
              <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">Tanggal &amp; Jatuh Tempo</TableHead>
              <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">Status</TableHead>
              <TableHead className="h-10 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">Bukti &amp; Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((record) => {
              const { isOverdue, tone, label } = getStatusDisplay(record, today);
              return (
                <TableRow key={record.id} className="border-border/60 hover:bg-surface-input/40">
                  <TableCell className="px-4 py-3 text-[13px] font-semibold text-text-primary">{formatCurrencyIdr(record.amount)}</TableCell>
                  <TableCell className="px-4 py-3">
                    <p className="text-[13px] text-text-primary">{formatIdDate(record.recordDate)}</p>
                    <p className={`mt-0.5 text-xs ${isOverdue ? "font-medium text-status-danger-fg" : "text-text-muted"}`}>
                      {record.dueDate
                        ? `${isOverdue ? "Melewati jatuh tempo" : "Jatuh tempo"} ${formatIdDate(record.dueDate)}`
                        : "Tanpa jatuh tempo"}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3"><StatusIndicator tone={tone}>{label}</StatusIndicator></TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {record.proofContentPath && (
                        <button
                          type="button"
                          onClick={() => openProof(record)}
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-surface-input px-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-active hover:text-text-primary"
                        >
                          <Eye className="size-3.5" />
                          Bukti
                        </button>
                      )}
                      <Button type="button" variant="outline" size="sm" className="h-8 px-2.5 text-xs text-text-secondary hover:text-text-primary" onClick={() => onEditRecord(record)}>
                        Ubah
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ProjectFilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
