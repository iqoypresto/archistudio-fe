"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  useCreatePayeeMutation,
  useCreatePaymentRecordMutation,
  usePayeeRecordsQuery,
  usePaymentPeopleQuery,
  useUpdatePaymentRecordMutation,
} from "@/hooks/payment.hooks";
import { canAccessPayments, getPayeeTypeLabel } from "@/lib/validation/payment.validation";
import { useAuthStore } from "@/stores/auth.store";
import type {
  PayeeType,
  PaymentRecordItem,
  PaymentStatus,
} from "@/types/api/payment.types";
import { PaymentPayeeFormModal } from "./PaymentPayeeFormModal";
import { PaymentPayeeList } from "./PaymentPayeeList";
import { PaymentRecordFormModal } from "./PaymentRecordFormModal";
import { PaymentRecordList } from "./PaymentRecordList";

interface PaymentWorkspaceContentProps {
  payeeType: PayeeType;
}

export function PaymentWorkspaceContent({ payeeType }: PaymentWorkspaceContentProps) {
  const role = useAuthStore((state) => state.user?.role);
  const allowed = canAccessPayments(role);
  const label = getPayeeTypeLabel(payeeType);

  const [search, setSearch] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "">("");
  const [isPayeeModalOpen, setIsPayeeModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<PaymentRecordItem | null>(null);

  const peopleQuery = usePaymentPeopleQuery(
    { type: payeeType, search: search.trim() || undefined },
    { enabled: allowed },
  );

  const people = useMemo(() => peopleQuery.data ?? [], [peopleQuery.data]);
  const selectedPayee = useMemo(
    () => people.find((item) => item.id === selectedPersonId) ?? people[0] ?? null,
    [people, selectedPersonId],
  );
  const activePersonId = selectedPayee?.id ?? null;

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
        Modul pembayaran {label} hanya dapat diakses oleh Owner (BR-36).
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Pembayaran ${label}`}
        description={`Pencatatan pembayaran ${label.toLowerCase()} global tanpa relasi project (khusus Owner — BR-36).`}
        action={
          <Button onClick={() => setIsPayeeModalOpen(true)} className="h-9 gap-1.5 text-xs">
            <Plus className="h-4 w-4" />
            Tambah {label}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
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
