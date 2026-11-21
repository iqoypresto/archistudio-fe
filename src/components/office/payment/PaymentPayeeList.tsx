"use client";

import { Plus, Search, User } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrencyIdr } from "@/lib/validation/payment.validation";
import type { PaymentPayeeItem } from "@/types/api/payment.types";

interface PaymentPayeeListProps {
  label: string;
  search: string;
  onSearchChange: (value: string) => void;
  people: PaymentPayeeItem[] | undefined;
  activePersonId: string | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onSelectPerson: (id: string) => void;
  onAddPerson: () => void;
}

export function PaymentPayeeList({
  label,
  search,
  onSearchChange,
  people,
  activePersonId,
  isLoading,
  isError,
  error,
  onRetry,
  onSelectPerson,
  onAddPerson,
}: PaymentPayeeListProps) {
  return (
    <section className="space-y-3.5 rounded-xl border border-border bg-surface p-4 lg:col-span-4">
      <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
        <h2 className="text-sm font-medium text-text-primary">Daftar {label}</h2>
        <span className="font-mono text-xs text-text-muted">{people?.length ?? 0} orang</span>
      </div>

      <div className="relative">
        <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={`Cari nama atau HP ${label.toLowerCase()}...`}
          className="h-9 pl-9 text-xs"
        />
      </div>

      <AsyncStateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={people}
        isEmpty={(items) => items.length === 0}
        onRetry={onRetry}
        emptyTitle={`Belum ada data ${label.toLowerCase()}`}
        emptyDescription={`Tambahkan ${label.toLowerCase()} pertama untuk mulai mencatat riwayat pembayaran.`}
        emptyAction={
          <Button onClick={onAddPerson} className="h-9 gap-1.5 text-xs">
            <Plus className="h-4 w-4" />
            Tambah {label}
          </Button>
        }
      >
        {(items) => (
          <div className="space-y-2">
            {items.map((person) => {
              const isActive = person.id === activePersonId;
              return (
                <Button
                  key={person.id}
                  type="button"
                  variant="outline"
                  aria-pressed={isActive}
                  onClick={() => onSelectPerson(person.id)}
                  className={`h-auto w-full justify-start rounded-xl p-3.5 text-left transition-colors ${
                    isActive
                      ? "border-white/20 bg-surface-active shadow-2xs"
                      : "border-border/80 bg-surface-input/60 hover:bg-surface-active/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-text-secondary" />
                      <span className="text-sm font-medium text-text-primary">{person.name}</span>
                    </div>
                    <StatusBadge tone={person.summary.unpaidCount > 0 ? "warning" : "success"}>
                      {person.summary.unpaidCount > 0
                        ? `${person.summary.unpaidCount} Belum Lunas`
                        : `${person.summary.recordCount} Catatan`}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {person.phone ?? "Tanpa nomor HP"}
                  </p>
                  <p className="mt-1.5 font-mono text-xs font-medium tabular-nums text-text-primary">
                    Belum dibayar: {formatCurrencyIdr(person.summary.totalUnpaid)}
                  </p>
                </Button>
              );
            })}
          </div>
        )}
      </AsyncStateView>
    </section>
  );
}
