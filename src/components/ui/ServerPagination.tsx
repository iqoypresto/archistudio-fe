import type { MouseEvent } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginationMeta } from "@/types/api";
import { PaginationPageSizeSelect } from "./PaginationPageSizeSelect";

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const paginationButtonTheme =
  "border-[var(--project-border,rgba(255,255,255,0.12))] bg-[var(--project-surface,var(--surface-input))] text-[var(--project-action,var(--secondary-foreground))] hover:border-[var(--project-action,rgba(255,255,255,0.24))] hover:bg-[var(--project-canvas,var(--surface-active))] hover:text-[var(--project-action-hover,var(--text-primary))]";
const activePaginationButtonTheme =
  "border-[var(--project-action,rgba(255,255,255,0.38))] bg-[var(--project-action,#2e323c)] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)] hover:bg-[var(--project-action-hover,#383d49)] hover:text-white";

export interface ServerPaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  showSummary?: boolean;
  isUpdating?: boolean;
}

export function ServerPagination({
  meta,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showSummary = false,
  isUpdating = false,
}: ServerPaginationProps) {
  const showFooterBar = Boolean(onPageSizeChange) || showSummary;
  if (!showFooterBar && meta.totalPages <= 1) return null;
  if (showFooterBar && meta.totalItems <= 0) return null;

  const totalPages = Math.max(1, meta.totalPages);
  const visiblePages = getVisiblePages(meta.page, totalPages);

  function changePage(event: MouseEvent<HTMLAnchorElement>, page: number) {
    event.preventDefault();
    if (isUpdating || page < 1 || page > totalPages || page === meta.page) return;
    onPageChange(page);
  }

  const navControls = (
    <PaginationControls
      meta={meta}
      visiblePages={visiblePages}
      compact={showFooterBar}
      isUpdating={isUpdating}
      onSelectPage={changePage}
    />
  );

  if (!showFooterBar) {
    return (
      <div className="flex justify-center py-2" aria-busy={isUpdating || undefined}>
        {navControls}
      </div>
    );
  }

  const startItem = Math.min((meta.page - 1) * meta.pageSize + 1, meta.totalItems);
  const endItem = Math.min(meta.page * meta.pageSize, meta.totalItems);

  return (
    <div
      className="flex flex-col gap-3 tabular-nums sm:flex-row sm:items-center sm:justify-between"
      aria-busy={isUpdating || undefined}
    >
      <p className="text-xs text-text-secondary">
        Menampilkan <span className="font-semibold text-text-primary">{startItem}–{endItem}</span>{" "}
        dari <span className="font-semibold text-text-primary">{meta.totalItems}</span> data
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        {onPageSizeChange && (
          <PaginationPageSizeSelect
            value={meta.pageSize}
            options={pageSizeOptions}
            disabled={isUpdating}
            onChange={onPageSizeChange}
          />
        )}
        {onPageSizeChange && <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />}
        {navControls}
      </div>
    </div>
  );
}

function PaginationControls({
  meta,
  visiblePages,
  compact,
  isUpdating,
  onSelectPage,
}: {
  meta: PaginationMeta;
  visiblePages: Array<number | "ellipsis">;
  compact: boolean;
  isUpdating: boolean;
  onSelectPage: (event: MouseEvent<HTMLAnchorElement>, page: number) => void;
}) {
  const sizeClass = compact
    ? "relative size-10 min-h-10 min-w-10 text-xs after:absolute after:-inset-0.5 after:content-[''] md:size-8 md:min-h-8 md:min-w-8 md:after:hidden"
    : "relative size-9 min-h-9 min-w-9 text-sm after:absolute after:-inset-1.5 after:rounded-lg after:content-['']";

  return (
    <Pagination
      aria-label="Navigasi halaman"
      className={compact ? "mx-0 w-auto justify-end" : "mx-0 w-full justify-center"}
    >
      <PaginationContent className={compact ? "gap-1.5" : "gap-3"}>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text=""
            aria-label="Halaman sebelumnya"
            aria-disabled={isUpdating || !meta.hasPreviousPage}
            tabIndex={isUpdating || !meta.hasPreviousPage ? -1 : 0}
            onClick={(event) => onSelectPage(event, meta.page - 1)}
            className={`${sizeClass} rounded-md p-0! aria-disabled:pointer-events-none aria-disabled:opacity-40 ${paginationButtonTheme}`}
          />
        </PaginationItem>
        {visiblePages.map((page, index) => (
          <PaginationItem key={page === "ellipsis" ? `ellipsis-${index}` : page}>
            {page === "ellipsis" ? (
              <PaginationEllipsis className="text-[var(--project-text-secondary,var(--text-muted))]" />
            ) : (
              <PaginationLink
                href="#"
                size="icon"
                isActive={page === meta.page}
                aria-label={`Halaman ${page}`}
                aria-current={page === meta.page ? "page" : undefined}
                aria-disabled={isUpdating || undefined}
                tabIndex={isUpdating ? -1 : 0}
                onClick={(event) => onSelectPage(event, page)}
                className={`${sizeClass} rounded-md font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring ${page === meta.page ? activePaginationButtonTheme : paginationButtonTheme}`}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            text=""
            aria-label="Halaman berikutnya"
            aria-disabled={isUpdating || !meta.hasNextPage}
            tabIndex={isUpdating || !meta.hasNextPage ? -1 : 0}
            onClick={(event) => onSelectPage(event, meta.page + 1)}
            className={`${sizeClass} rounded-md p-0! aria-disabled:pointer-events-none aria-disabled:opacity-40 ${paginationButtonTheme}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function getVisiblePages(current: number, total: number): Array<number | "ellipsis"> {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const visible: Array<number | "ellipsis"> = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) visible.push("ellipsis");
    visible.push(page);
  });

  return visible;
}
