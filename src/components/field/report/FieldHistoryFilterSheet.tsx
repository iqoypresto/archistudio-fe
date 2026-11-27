"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { FieldHistoryFilters } from "./field-history.types";

interface FieldHistoryFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: FieldHistoryFilters;
  onDraftChange: (filters: FieldHistoryFilters) => void;
  onApply: (filters: FieldHistoryFilters) => void;
}

export function FieldHistoryFilterSheet({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onApply,
}: FieldHistoryFilterSheetProps) {
  function changeSortOrder(value: string | null) {
    onDraftChange({
      ...draft,
      sortOrder: value === "asc" ? "asc" : undefined,
    });
  }

  function changeDateFrom(value: string) {
    onDraftChange({
      ...draft,
      dateFrom: value || undefined,
      ...(value && draft.dateTo && value > draft.dateTo ? { dateTo: undefined } : {}),
    });
  }

  function changeDateTo(value: string) {
    onDraftChange({
      ...draft,
      dateTo: value || undefined,
      ...(value && draft.dateFrom && value < draft.dateFrom ? { dateFrom: undefined } : {}),
    });
  }

  function applyDraft() {
    onApply(draft);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        closeButtonLabel="Tutup filter"
        overlayClassName="bg-black/55 backdrop-blur-none supports-backdrop-filter:backdrop-blur-none"
        className="max-h-[88svh] gap-3 overflow-y-auto rounded-t-[1.5rem] border border-[#e8d9cf] bg-[#fffaf7] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2 text-[#1d1c1b] shadow-[0_-16px_40px_rgba(29,28,27,0.2)]"
      >
        <div aria-hidden="true" className="mx-auto h-1.5 w-12 shrink-0 rounded-full bg-[#d8c3b6]" />
        <SheetHeader className="px-1 pb-1 pt-5">
          <SheetTitle className="text-xl font-bold text-[#1d1c1b]">Filter laporan</SheetTitle>
          <SheetDescription className="text-sm leading-5 text-[#64564d]">
            Atur urutan tanggal atau pilih rentang laporan.
          </SheetDescription>
        </SheetHeader>

        <div className="grid min-w-0 gap-4 px-1">
          <label className="grid min-w-0 gap-1.5 text-sm font-semibold">
            Urutkan tanggal
            <Select value={draft.sortOrder ?? "desc"} onValueChange={changeSortOrder}>
              <SelectTrigger aria-label="Urutan tanggal laporan" className="min-h-12 min-w-0 border-[#e8d9cf] bg-white text-base text-[#1d1c1b]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Tanggal terbaru</SelectItem>
                <SelectItem value="asc">Tanggal terlama</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <fieldset className="grid min-w-0 gap-2">
            <legend className="mb-1 text-sm font-semibold text-[#1d1c1b]">Rentang tanggal</legend>
            <div className="grid min-w-0 grid-cols-1 gap-3 min-[380px]:grid-cols-2">
              <label className="grid min-w-0 gap-1.5 text-sm text-[#64564d]">
                Dari
                <Input type="date" value={draft.dateFrom ?? ""} max={draft.dateTo} onChange={(event) => changeDateFrom(event.target.value)} aria-label="Tanggal mulai" className="min-h-12 min-w-0 border-[#e8d9cf] bg-white text-base text-[#1d1c1b]" />
              </label>
              <label className="grid min-w-0 gap-1.5 text-sm text-[#64564d]">
                Sampai
                <Input type="date" value={draft.dateTo ?? ""} min={draft.dateFrom} onChange={(event) => changeDateTo(event.target.value)} aria-label="Tanggal akhir" className="min-h-12 min-w-0 border-[#e8d9cf] bg-white text-base text-[#1d1c1b]" />
              </label>
            </div>
          </fieldset>
        </div>

        <SheetFooter className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-[#e8d9cf] bg-[#f7f3ef] p-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="min-h-12 min-w-0 w-full whitespace-nowrap border-[#d8c3b6] bg-white px-2 text-sm text-[#75442d] hover:bg-[#f7eee8]">
            Batal
          </Button>
          <Button type="button" onClick={applyDraft} className="min-h-12 min-w-0 w-full whitespace-nowrap bg-[#9c471d] px-2 text-sm text-white hover:bg-[#823b19]">
            Terapkan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
