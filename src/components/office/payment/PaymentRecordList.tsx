"use client";

import { ExternalLink, Plus } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatIdDate, getTodayInJakarta } from "@/lib/utils/office-format";
import { formatCurrencyIdr } from "@/lib/validation/payment.validation";
import type { PaymentPayeeItem, PaymentRecordItem, PaymentStatus } from "@/types/api/payment.types";
import { fileApi } from "@/lib/api/file.api";

type StatusSegment = "ALL" | PaymentStatus;

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "UNPAID", label: "Belum Dibayar" },
  { value: "PAID", label: "Sudah Dibayar" },
] as const;

interface PaymentRecordListProps {
  selectedPayee: PaymentPayeeItem | null;
  records: PaymentRecordItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  statusFilter: PaymentStatus | "";
  onStatusFilterChange: (value: PaymentStatus | "") => void;
  onRetry: () => void;
  onAddRecord: () => void;
  onEditRecord: (record: PaymentRecordItem) => void;
}

export function PaymentRecordList({
  selectedPayee,
  records,
  isLoading,
  isError,
  error,
  statusFilter,
  onStatusFilterChange,
  onRetry,
  onAddRecord,
  onEditRecord,
}: PaymentRecordListProps) {
  if (!selectedPayee) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-text-secondary">
        Pilih salah satu nama di daftar kiri untuk melihat atau menambahkan riwayat pembayaran.
      </div>
    );
  }

  const segmentValue: StatusSegment = statusFilter || "ALL";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-text-primary">
            {selectedPayee.name}
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            {selectedPayee.phone ?? "Nomor HP belum diisi"} · {selectedPayee.summary.recordCount}{" "}
            transaksi tercatat
          </p>
        </div>
        <Button type="button" size="sm" onClick={onAddRecord} className="h-9 gap-1.5 self-start text-xs sm:self-auto">
          <Plus className="size-3.5" />
          Tambah Catatan
        </Button>
      </div>

      <div className="grid grid-cols-1 divide-y divide-border border-b border-border bg-canvas/40 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-5 py-3.5">
          <p className="text-xs text-text-muted">
            Sudah Dibayar ({selectedPayee.summary.paidCount})
          </p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {formatCurrencyIdr(selectedPayee.summary.totalPaid)}
          </p>
        </div>
        <div className="px-5 py-3.5">
          <p className="text-xs text-text-muted">
            Belum Dibayar ({selectedPayee.summary.unpaidCount})
          </p>
          <p
            className={`mt-1 text-lg font-semibold ${
              selectedPayee.summary.totalUnpaid > 0 ? "text-status-warning-fg" : "text-text-primary"
            }`}
          >
            {formatCurrencyIdr(selectedPayee.summary.totalUnpaid)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5">
        <h3 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
          Riwayat Transaksi
        </h3>
        <SegmentedControl
          ariaLabel="Filter status pembayaran"
          options={STATUS_OPTIONS}
          value={segmentValue}
          onChange={(val) => onStatusFilterChange(val === "ALL" ? "" : val)}
        />
      </div>

      <AsyncStateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={records}
        isEmpty={(items) => items.length === 0}
        onRetry={onRetry}
        emptyTitle="Belum ada catatan pembayaran"
        emptyDescription="Tambahkan catatan pembayaran pertama untuk orang ini."
      >
        {(items) => (
          <div className="border-t border-border">
            <Table>
              <TableHeader className="bg-surface-input/50">
                <TableRow className="border-border/80 hover:bg-transparent">
                  <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
                    Nominal
                  </TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
                    Tanggal &amp; Jatuh Tempo
                  </TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
                    Status
                  </TableHead>
                  <TableHead className="h-10 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">
                    Bukti &amp; Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((record) => {
                  const isOverdue =
                    record.status === "UNPAID" &&
                    Boolean(record.dueDate) &&
                    (record.dueDate as string) < getTodayInJakarta();
                  return (
                  <TableRow key={record.id} className="border-border/60 hover:bg-surface-input/40">
                    <TableCell className="px-4 py-3 text-[13px] font-semibold text-text-primary">
                      {formatCurrencyIdr(record.amount)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <p className="text-[13px] text-text-primary">
                        {formatIdDate(record.recordDate)}
                      </p>
                      <p
                        className={`mt-0.5 text-xs ${
                          isOverdue ? "font-medium text-status-danger-fg" : "text-text-muted"
                        }`}
                      >
                        {record.dueDate
                          ? `${isOverdue ? "Melewati jatuh tempo" : "Jatuh tempo"} ${formatIdDate(record.dueDate)}`
                          : "Tanpa jatuh tempo"}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusIndicator
                        tone={record.status === "PAID" ? "success" : isOverdue ? "danger" : "warning"}
                      >
                        {record.status === "PAID"
                          ? "Sudah Dibayar"
                          : isOverdue
                            ? "Jatuh Tempo"
                            : "Belum Dibayar"}
                      </StatusIndicator>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {record.proofContentPath && (
                          <button
                            type="button"
                            onClick={() => void fileApi.openContent(record.proofContentPath!)}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-surface-input px-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-active hover:text-text-primary"
                          >
                            <ExternalLink className="size-3" />
                            Bukti
                          </button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-text-secondary hover:text-text-primary"
                          onClick={() => onEditRecord(record)}
                        >
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
        )}
      </AsyncStateView>
    </div>
  );
}
