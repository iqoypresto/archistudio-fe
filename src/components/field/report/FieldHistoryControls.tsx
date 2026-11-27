"use client";

import { useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFieldHistoryDateRange } from "./field-history-date.utils";
import { FieldHistoryFilterSheet } from "./FieldHistoryFilterSheet";
import type { FieldHistoryFilters } from "./field-history.types";

interface FieldHistoryControlsProps {
  search: string;
  filters: FieldHistoryFilters;
  onSearchChange: (value: string) => void;
  onApplyFilters: (filters: FieldHistoryFilters) => void;
}

export function FieldHistoryControls({
  search,
  filters,
  onSearchChange,
  onApplyFilters,
}: FieldHistoryControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<FieldHistoryFilters>({});
  const activeFilterCount = Number(Boolean(filters.dateFrom || filters.dateTo))
    + Number(filters.sortOrder === "asc");

  function openFilters() {
    setDraft(filters);
    setIsOpen(true);
  }

  function removeFilter(filter: "date" | "sort") {
    const next = { ...filters };
    if (filter === "date") {
      delete next.dateFrom;
      delete next.dateTo;
    } else {
      delete next.sortOrder;
    }
    onApplyFilters(next);
  }

  return (
    <>
      <div className="space-y-3">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-[var(--project-text-secondary)]" aria-hidden="true" />
            <Input
              type="search"
              value={search}
              maxLength={100}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Cari proyek atau area"
              aria-label="Cari proyek atau area"
              className="min-h-12 rounded-[1rem] border-[var(--project-border)] bg-[var(--project-surface)] pl-11 text-base text-[var(--project-text-heading)] placeholder:text-[var(--project-text-secondary)]"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            onClick={openFilters}
            className="min-h-12 shrink-0 gap-2 rounded-[1rem] border-[var(--project-action)] px-3 text-sm font-semibold text-[var(--project-action)] hover:bg-[var(--project-illustration-paper)] hover:text-[var(--project-action-hover)] min-[360px]:px-4"
          >
            <Filter className="size-4 shrink-0" aria-hidden="true" />
            <span>{activeFilterCount ? `Filter (${activeFilterCount})` : "Filter"}</span>
          </Button>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap gap-2">
              {filters.sortOrder === "asc" && (
                <FilterChip
                  prefix="Urutan:"
                  value="Tanggal terlama"
                  removeLabel="Kembalikan urutan ke tanggal terbaru"
                  onRemove={() => removeFilter("sort")}
                />
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <FilterChip
                  prefix="Tanggal:"
                  value={formatFieldHistoryDateRange(filters.dateFrom, filters.dateTo)}
                  removeLabel="Hapus filter rentang tanggal"
                  onRemove={() => removeFilter("date")}
                />
              )}
            </div>
            {activeFilterCount > 1 && (
              <button
                type="button"
                onClick={() => onApplyFilters({})}
                className="min-h-12 shrink-0 px-1 text-sm font-semibold text-[var(--project-action)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--project-action)]"
              >
                Hapus semua
              </button>
            )}
          </div>
        )}
      </div>

      <FieldHistoryFilterSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        draft={draft}
        onDraftChange={setDraft}
        onApply={onApplyFilters}
      />
    </>
  );
}

function FilterChip({ prefix, value, removeLabel, onRemove }: {
  prefix: string;
  value: string;
  removeLabel: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={removeLabel}
      onClick={onRemove}
      className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full bg-[var(--project-illustration-paper)] px-3 py-1.5 text-left text-sm leading-5 text-[var(--project-text-heading)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--project-action)]"
    >
      <span className="min-w-0 break-words"><span className="font-semibold text-[var(--project-action)]">{prefix}</span> {value}</span>
      <X className="size-4 shrink-0 text-[var(--project-text-heading)]" aria-hidden="true" />
    </button>
  );
}
