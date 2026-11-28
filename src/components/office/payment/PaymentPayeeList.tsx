"use client";

import { ChevronRight, Plus, Search } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrencyIdr } from "@/lib/validation/payment.validation";
import { cn } from "@/lib/utils";
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
  className?: string;
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
  className,
}: PaymentPayeeListProps) {
  return (
    <section className={cn("overflow-hidden rounded-xl border border-border bg-surface lg:col-span-4", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <h2 className="text-sm font-semibold text-text-primary">Daftar {label}</h2>
        <span className="text-xs text-text-muted">{people?.length ?? 0} orang</span>
      </div>

      <div className="border-b border-border p-3.5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={`Cari nama atau HP ${label.toLowerCase()}...`}
            className="h-11 pl-8 lg:h-9 lg:text-xs"
          />
        </div>
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
          <Button type="button" onClick={onAddPerson} className="h-9 gap-1.5 text-xs">
            <Plus className="size-3.5" />
            Tambah {label}
          </Button>
        }
      >
        {(items) => (
          <div className="divide-y divide-border/70">
            {items.map((person) => {
              const isActive = person.id === activePersonId;
              const hasUnpaid = person.summary.unpaidCount > 0;
              const overdueCount = person.summary.overdueUnpaidCount ?? 0;
              return (
                <button
                  key={person.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onSelectPerson(person.id)}
                  className={cn(
                    "relative flex w-full flex-col gap-1 px-4 py-3.5 text-left transition-colors",
                    isActive
                      ? "bg-surface-active/70"
                      : "hover:bg-surface-input/50",
                  )}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2.5 left-0 w-0.5 rounded-r bg-text-primary"
                    />
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold text-text-primary">
                      {person.name}
                    </span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span
                        className={cn(
                          "text-[11px] font-medium",
                          overdueCount > 0
                            ? "text-status-danger-fg"
                            : hasUnpaid
                              ? "text-status-warning-fg"
                              : "text-text-muted",
                        )}
                      >
                        {overdueCount > 0
                          ? `${overdueCount} jatuh tempo`
                          : hasUnpaid
                            ? `${person.summary.unpaidCount} belum lunas`
                            : `${person.summary.recordCount} lunas`}
                      </span>
                      <ChevronRight className="size-4 text-text-muted lg:hidden" aria-hidden="true" />
                    </div>
                  </div>
                  <p className="text-xs text-text-muted">{person.phone ?? "Tanpa nomor HP"}</p>
                  <p className="pt-0.5 text-xs text-text-secondary">
                    Belum dibayar:{" "}
                    <span
                      className={cn(
                        "font-medium",
                        hasUnpaid ? "text-text-primary" : "text-text-muted",
                      )}
                    >
                      {formatCurrencyIdr(person.summary.totalUnpaid)}
                    </span>
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </AsyncStateView>
    </section>
  );
}
