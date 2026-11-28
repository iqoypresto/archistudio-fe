"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { formatCurrencyIdr } from "@/lib/validation/payment.validation";
import type { PaymentPayeeItem, PaymentRecordItem, PaymentStatus } from "@/types/api/payment.types";
import { PaymentRecordRows } from "./PaymentRecordRows";

type StatusSegment = "ALL" | PaymentStatus;

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "UNPAID", label: "Belum Dibayar" },
  { value: "PAID", label: "Sudah Dibayar" },
] as const;

interface PaymentRecordListProps {
  payeeLabel: string;
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
  onBackToList?: () => void;
}

export function PaymentRecordList({
  payeeLabel,
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
  onBackToList,
}: PaymentRecordListProps) {
  if (!selectedPayee) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-text-secondary">
        Pilih salah satu nama dari daftar untuk melihat atau menambahkan riwayat pembayaran.
      </div>
    );
  }

  const segmentValue: StatusSegment = statusFilter || "ALL";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {onBackToList && (
        <div className="border-b border-border bg-canvas/40 px-4 py-2.5 lg:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBackToList}
            className="h-10 gap-1.5 px-3 text-xs text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="size-3.5" />
            Kembali ke Daftar {payeeLabel}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-text-primary">
            {selectedPayee.name}
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            {selectedPayee.phone ?? "Nomor HP belum diisi"} · {selectedPayee.summary.recordCount}{" "}
            transaksi tercatat
          </p>
        </div>
        <Button type="button" size="sm" onClick={onAddRecord} className="h-11 w-full gap-1.5 text-xs sm:h-9 sm:w-auto">
          <Plus className="size-3.5" />
          Tambah Catatan
        </Button>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-b border-border bg-canvas/40">
        <div className="px-4 py-3 sm:px-5 sm:py-3.5">
          <p className="text-xs text-text-muted">
            Sudah Dibayar ({selectedPayee.summary.paidCount})
          </p>
          <p className="mt-1 truncate text-base font-semibold text-text-primary sm:text-lg">
            {formatCurrencyIdr(selectedPayee.summary.totalPaid)}
          </p>
        </div>
        <div className="px-4 py-3 sm:px-5 sm:py-3.5">
          <p className="text-xs text-text-muted">
            Belum Dibayar ({selectedPayee.summary.unpaidCount})
          </p>
          <p
            className={`mt-1 truncate text-base font-semibold sm:text-lg ${
              selectedPayee.summary.totalUnpaid > 0 ? "text-status-warning-fg" : "text-text-primary"
            }`}
          >
            {formatCurrencyIdr(selectedPayee.summary.totalUnpaid)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h3 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
          Riwayat Transaksi
        </h3>
        <SegmentedControl
          ariaLabel="Filter status pembayaran"
          options={STATUS_OPTIONS}
          value={segmentValue}
          onChange={(val) => onStatusFilterChange(val === "ALL" ? "" : val)}
          className="grid w-full auto-cols-fr grid-flow-col sm:inline-flex sm:w-auto"
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
        {(items) => <PaymentRecordRows items={items} onEditRecord={onEditRecord} />}
      </AsyncStateView>
    </div>
  );
}
