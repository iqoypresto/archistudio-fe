"use client";

import { Calendar, Clock, ExternalLink, Pencil, Phone, Plus } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrencyIdr } from "@/lib/validation/payment.validation";
import type {
  PaymentPayeeItem,
  PaymentRecordItem,
  PaymentStatus,
} from "@/types/api/payment.types";

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
      <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-text-secondary">
        Pilih salah satu nama di daftar kiri untuk melihat atau menambahkan riwayat catatan pembayaran.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{selectedPayee.name}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-secondary">
            <Phone className="h-3.5 w-3.5" />
            {selectedPayee.phone ?? "Nomor HP belum diisi"}
          </p>
        </div>
        <Button onClick={onAddRecord} className="min-h-11 gap-1.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Tambah Catatan
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-status-success-bg/60 p-3">
          <p className="text-xs text-status-success-fg">Sudah Dibayar ({selectedPayee.summary.paidCount})</p>
          <p className="mt-0.5 text-base font-bold text-text-primary">
            {formatCurrencyIdr(selectedPayee.summary.totalPaid)}
          </p>
        </div>
        <div className="rounded-lg bg-status-warning-bg/60 p-3">
          <p className="text-xs text-status-warning-fg">
            Belum Dibayar ({selectedPayee.summary.unpaidCount})
          </p>
          <p className="mt-0.5 text-base font-bold text-text-primary">
            {formatCurrencyIdr(selectedPayee.summary.totalUnpaid)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-primary">Riwayat Catatan Pembayaran</h3>
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as PaymentStatus | "")}
          aria-label="Filter status pembayaran"
          className="border-border bg-surface text-text-primary focus:ring-primary h-10 rounded-lg border px-3 text-xs focus:outline-none focus:ring-2"
        >
          <option value="">Semua Status</option>
          <option value="UNPAID">Belum Dibayar</option>
          <option value="PAID">Sudah Dibayar</option>
        </select>
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
          <div className="space-y-2.5">
            {items.map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-surface-subtle/50 p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-text-primary">
                      {formatCurrencyIdr(record.amount)}
                    </span>
                    <StatusBadge tone={record.status === "PAID" ? "success" : "warning"}>
                      {record.status === "PAID" ? "Sudah Dibayar" : "Belum Dibayar"}
                    </StatusBadge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Tanggal: {record.recordDate}
                    </span>
                    {record.dueDate && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Jatuh Tempo: {record.dueDate}
                      </span>
                    )}
                  </div>
                  {record.proofViewUrl && (
                    <a
                      href={record.proofViewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Lihat Bukti ({record.proofFileName ?? "Gambar"})
                    </a>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 gap-1.5 self-start sm:self-center"
                  onClick={() => onEditRecord(record)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Ubah
                </Button>
              </div>
            ))}
          </div>
        )}
      </AsyncStateView>
    </div>
  );
}
