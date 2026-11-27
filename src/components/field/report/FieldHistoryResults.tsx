import type { ReactNode } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServerPagination } from "@/components/ui/ServerPagination";
import { Skeleton } from "@/components/ui/skeleton";
import type { useMyReportHistoryQuery } from "@/hooks/report.hooks";
import type { FieldHistoryFilters } from "./field-history.types";
import { FieldHistoryReportList } from "./FieldHistoryReportList";

type HistoryQuery = ReturnType<typeof useMyReportHistoryQuery>;

interface FieldHistoryResultsProps {
  query: HistoryQuery;
  filters: FieldHistoryFilters;
  search: string;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

export function FieldHistoryResults({
  query,
  filters,
  search,
  onPageChange,
  onClearFilters,
}: FieldHistoryResultsProps) {
  if (query.isPending) return <HistoryLoading />;

  if (query.isError) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-[1.125rem] px-4 py-8 text-center">
        <p className="text-base font-semibold text-[var(--project-text-heading)]">Riwayat laporan belum bisa dimuat.</p>
        <p className="max-w-sm text-sm leading-5 text-[var(--project-text-secondary)]">Periksa koneksi internet, lalu coba muat kembali.</p>
        <Button
          type="button"
          onClick={() => void query.refetch()}
          className="min-h-12 gap-2 bg-[var(--project-action)] text-white hover:bg-[var(--project-action-hover)]"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Coba lagi
        </Button>
      </div>
    );
  }

  const result = query.data;
  if (!result || result.data.length === 0) {
    const hasActiveFilter = Boolean(filters.dateFrom || filters.dateTo);
    const hasSearch = Boolean(search.trim());
    if (!hasActiveFilter && !hasSearch) {
      return (
        <EmptyHistory
          title="Belum ada laporan yang pernah dikirim"
          description="Laporan yang sudah Anda kirim akan muncul di sini."
        />
      );
    }

    return (
      <EmptyHistory
        title="Tidak ada laporan yang cocok"
        description={buildNoMatchDescription(filters, search)}
        action={(
          <Button
            type="button"
            onClick={onClearFilters}
            className="min-h-12 bg-[var(--project-action)] px-5 text-white hover:bg-[var(--project-action-hover)]"
          >
            Hapus filter
          </Button>
        )}
      />
    );
  }

  return (
    <section aria-busy={query.isFetching || undefined} className="space-y-4">
      <FieldHistoryReportList
        reports={result.data}
      />
      <ServerPagination
        meta={result.meta}
        onPageChange={onPageChange}
        isUpdating={query.isFetching}
      />
    </section>
  );
}

function HistoryLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Memuat riwayat laporan">
      <Skeleton className="h-8 w-full rounded-[1rem] bg-[var(--project-skeleton)]" />
      <Skeleton className="h-28 w-full rounded-[1.125rem] bg-[var(--project-skeleton)]" />
      <Skeleton className="h-28 w-full rounded-[1.125rem] bg-[var(--project-skeleton)]" />
    </div>
  );
}

function EmptyHistory({ title, description, action }: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div role="status" className="flex min-h-64 flex-col items-center justify-center gap-3 px-2 py-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-[var(--project-illustration-paper)] text-[var(--project-action)]">
        <FileText className="size-7" aria-hidden="true" />
      </span>
      <h2 className="max-w-sm break-words text-lg font-bold leading-6 text-[var(--project-text-heading)]">{title}</h2>
      <p className="max-w-sm break-words text-sm leading-5 text-[var(--project-text-secondary)]">{description}</p>
      {action}
    </div>
  );
}

function buildNoMatchDescription(filters: FieldHistoryFilters, search: string): string {
  const criteria: string[] = [];
  if (search.trim()) criteria.push(`pencarian “${search.trim()}”`);
  if (filters.dateFrom || filters.dateTo) criteria.push("rentang tanggal yang dipilih");
  return `Tidak ada laporan yang sesuai dengan ${criteria.join(", ")}. Hapus filter atau ubah pencarian untuk melihat hasil lainnya.`;
}
