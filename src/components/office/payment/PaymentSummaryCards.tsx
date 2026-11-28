import { formatCurrencyIdr } from "@/lib/validation/payment.validation";

interface PaymentSummaryCardsProps {
  label: string;
  peopleCount: number;
  totalPaid: number;
  totalUnpaid: number;
  paidCount: number;
  unpaidCount: number;
  overdueUnpaidCount: number;
}

export function PaymentSummaryCards({
  label,
  peopleCount,
  totalPaid,
  totalUnpaid,
  paidCount,
  unpaidCount,
  overdueUnpaidCount,
}: PaymentSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5">
      <div className="col-span-2 rounded-xl border border-border bg-surface p-3.5 sm:order-2 sm:col-span-1 sm:p-4">
        <p className="text-xs text-text-secondary">Total Belum Dibayar</p>
        <p
          className={`mt-2 text-xl font-semibold tracking-tight sm:text-2xl ${
            overdueUnpaidCount > 0
              ? "text-status-danger-fg"
              : totalUnpaid > 0
                ? "text-status-warning-fg"
                : "text-text-primary"
          }`}
        >
          {formatCurrencyIdr(totalUnpaid)}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {unpaidCount} tagihan menunggu
          {overdueUnpaidCount > 0 ? ` · ${overdueUnpaidCount} jatuh tempo` : ""}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-3.5 sm:order-1 sm:p-4">
        <p className="text-xs text-text-secondary">Total {label}</p>
        <p className="mt-2 text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
          {peopleCount}
        </p>
        <p className="mt-1 text-[11px] text-text-muted sm:text-xs">
          {paidCount + unpaidCount} catatan pembayaran
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-3.5 sm:order-3 sm:p-4">
        <p className="text-xs text-text-secondary">Sudah Dibayar</p>
        <p className="mt-2 truncate text-lg font-semibold tracking-tight text-text-primary sm:text-2xl">
          {formatCurrencyIdr(totalPaid)}
        </p>
        <p className="mt-1 text-[11px] text-text-muted sm:text-xs">{paidCount} lunas</p>
      </div>
    </div>
  );
}
