"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageInfoDialog } from "@/components/ui/PageInfoDialog";
import {
  useCreatePayeeMutation, useCreatePaymentRecordMutation, usePayeeRecordsQuery,
  usePaymentPeopleQuery, useUpdatePaymentRecordMutation,
} from "@/hooks/payment.hooks";
import { canAccessPayments, formatCurrencyIdr, getPayeeTypeLabel } from "@/lib/validation/payment.validation";
import { useAuthStore } from "@/stores/auth.store";
import type { PayeeType, PaymentRecordItem, PaymentStatus } from "@/types/api/payment.types";
import { PaymentPayeeFormModal } from "./PaymentPayeeFormModal";
import { PaymentPayeeList } from "./PaymentPayeeList";
import { PaymentRecordFormModal } from "./PaymentRecordFormModal";
import { PaymentRecordList } from "./PaymentRecordList";

export function PaymentWorkspaceContent({ payeeType }: { payeeType: PayeeType }) {
  const role = useAuthStore((state) => state.user?.role);
  const allowed = canAccessPayments(role);
  const label = getPayeeTypeLabel(payeeType);

  const [search, setSearch] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "">("");
  const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<PaymentRecordItem | null>(null);

  const allPeopleQuery = usePaymentPeopleQuery({ type: payeeType }, { enabled: allowed });
  const peopleQuery = usePaymentPeopleQuery(
    { type: payeeType, search: search.trim() || undefined },
    { enabled: allowed },
  );

  const allPeople = useMemo(() => allPeopleQuery.data ?? [], [allPeopleQuery.data]);
  const people = useMemo(() => peopleQuery.data ?? [], [peopleQuery.data]);
  const selectedPayee = useMemo(
    () => people.find((item) => item.id === selectedPersonId) ?? people[0] ?? null,
    [people, selectedPersonId],
  );
  const activePersonId = selectedPayee?.id ?? null;

  const globalTotals = useMemo(
    () =>
      allPeople.reduce(
        (acc, person) => ({
          totalPaid: acc.totalPaid + person.summary.totalPaid,
          totalUnpaid: acc.totalUnpaid + person.summary.totalUnpaid,
          paidCount: acc.paidCount + person.summary.paidCount,
          unpaidCount: acc.unpaidCount + person.summary.unpaidCount,
          overdueUnpaidCount: acc.overdueUnpaidCount + (person.summary.overdueUnpaidCount ?? 0),
        }),
        { totalPaid: 0, totalUnpaid: 0, paidCount: 0, unpaidCount: 0, overdueUnpaidCount: 0 },
      ),
    [allPeople],
  );

  const recordsQuery = usePayeeRecordsQuery(
    activePersonId,
    statusFilter ? { status: statusFilter } : undefined,
    { enabled: allowed && Boolean(activePersonId) },
  );

  const createPayee = useCreatePayeeMutation((createdId) => {
    setSelectedPersonId(createdId);
    setIsPayeeModalOpen(false);
  });
  const createRecord = useCreatePaymentRecordMutation(activePersonId, () => {
    setIsRecordModalOpen(false);
  });
  const updateRecord = useUpdatePaymentRecordMutation(() => {
    setIsRecordModalOpen(false);
    setRecordToEdit(null);
  });

  if (!allowed) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary">
        Modul pembayaran {label} hanya dapat diakses oleh Owner.
      </div>
    );
  }

  return (
    <div className="space-y-5 tabular-nums">
      <PageHeader
        title={`Pembayaran ${label}`}
        titleSuffix={
          <PageInfoDialog
            title={`Tentang Pembayaran ${label}`}
            description={`Catat dan pantau pembayaran ${label.toLowerCase()} global di luar proyek beserta bukti transfer.`}
          />
        }
        action={
          <Button type="button" onClick={() => setIsPayeeModalOpen(true)} className="h-9 gap-1.5 text-xs">
            <Plus className="size-3.5" />
            Tambah {label}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Total {label} Tercatat</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
            {allPeople.length}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {globalTotals.paidCount + globalTotals.unpaidCount} catatan pembayaran
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Total Belum Dibayar</p>
          <p
            className={`mt-2 text-2xl font-semibold tracking-tight ${
              globalTotals.overdueUnpaidCount > 0
                ? "text-status-danger-fg"
                : globalTotals.totalUnpaid > 0
                  ? "text-status-warning-fg"
                  : "text-text-primary"
            }`}
          >
            {formatCurrencyIdr(globalTotals.totalUnpaid)}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {globalTotals.unpaidCount} tagihan menunggu
            {globalTotals.overdueUnpaidCount > 0
              ? ` · ${globalTotals.overdueUnpaidCount} melewati jatuh tempo`
              : ""}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-text-secondary">Total Sudah Dibayar</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
            {formatCurrencyIdr(globalTotals.totalPaid)}
          </p>
          <p className="mt-1 text-xs text-text-muted">{globalTotals.paidCount} pembayaran lunas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        <PaymentPayeeList
          label={label}
          search={search}
          onSearchChange={setSearch}
          people={peopleQuery.data}
          activePersonId={activePersonId}
          isLoading={peopleQuery.isLoading}
          isError={peopleQuery.isError}
          error={peopleQuery.error}
          onRetry={() => peopleQuery.refetch()}
          onSelectPerson={(id) => {
            setSelectedPersonId(id);
            setStatusFilter("");
          }}
          onAddPerson={() => setIsPayeeModalOpen(true)}
        />

        <section className="lg:col-span-8">
          <PaymentRecordList
            selectedPayee={selectedPayee}
            records={recordsQuery.data}
            isLoading={recordsQuery.isLoading}
            isError={recordsQuery.isError}
            error={recordsQuery.error}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onRetry={() => recordsQuery.refetch()}
            onAddRecord={() => {
              setRecordToEdit(null);
              setIsRecordModalOpen(true);
            }}
            onEditRecord={(record) => {
              setRecordToEdit(record);
              setIsRecordModalOpen(true);
            }}
          />
        </section>
      </div>

      <PaymentPayeeFormModal
        isOpen={isPayeeModalOpen}
        onClose={() => setIsPayeeModalOpen(false)}
        payeeType={payeeType}
        onSubmit={(payload) => createPayee.mutate(payload)}
        isSubmitting={createPayee.isPending}
      />

      {selectedPayee && isRecordModalOpen && (
        <PaymentRecordFormModal
          key={`${selectedPayee.id}-${recordToEdit?.id ?? "new"}`}
          isOpen={isRecordModalOpen}
          onClose={() => {
            setIsRecordModalOpen(false);
            setRecordToEdit(null);
          }}
          payeeId={selectedPayee.id}
          payeeName={selectedPayee.name}
          recordToEdit={recordToEdit}
          onSubmitCreate={(payload) => createRecord.mutate(payload)}
          onSubmitUpdate={(recordId, payload) => updateRecord.mutate({ recordId, payload })}
          isSubmitting={createRecord.isPending || updateRecord.isPending}
        />
      )}
    </div>
  );
}
