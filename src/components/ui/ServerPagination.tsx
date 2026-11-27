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

const paginationButtonTheme =
  "border-[var(--project-border,var(--border))] bg-[var(--project-surface,var(--background))] text-[var(--project-action,var(--primary))] hover:bg-[var(--project-canvas,var(--muted))] hover:text-[var(--project-action-hover,var(--primary-hover))]";
const activePaginationButtonTheme =
  "border-transparent bg-[var(--project-action,var(--primary))] text-white hover:bg-[var(--project-action-hover,var(--primary-hover))]";

interface ServerPaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  isUpdating?: boolean;
}

export function ServerPagination({
  meta,
  onPageChange,
  isUpdating = false,
}: ServerPaginationProps) {
  if (meta.totalPages <= 1) return null;

  const totalPages = meta.totalPages;
  const visiblePages = getVisiblePages(meta.page, totalPages);

  function changePage(event: MouseEvent<HTMLAnchorElement>, page: number) {
    event.preventDefault();
    if (isUpdating || page < 1 || page > totalPages || page === meta.page) return;
    onPageChange(page);
  }

  return (
    <div className="flex justify-center py-2" aria-busy={isUpdating || undefined}>
      <Pagination
        aria-label="Navigasi halaman laporan"
        className="mx-0 w-full justify-center"
      >
        <PaginationContent className="gap-3">
          <PaginationItem>
            <PaginationPrevious
              href="#"
              text=""
              aria-label="Halaman sebelumnya"
              aria-disabled={isUpdating || !meta.hasPreviousPage}
              tabIndex={isUpdating || !meta.hasPreviousPage ? -1 : 0}
              onClick={(event) => changePage(event, meta.page - 1)}
              className={`relative size-9 min-h-9 min-w-9 rounded-md p-0! after:absolute after:-inset-1.5 after:rounded-lg after:content-[''] aria-disabled:pointer-events-none aria-disabled:opacity-45 ${paginationButtonTheme}`}
            />
          </PaginationItem>
          {visiblePages.map((page, index) => (
            <PaginationItem key={page === "ellipsis" ? `ellipsis-${index}` : page}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  size="icon"
                  isActive={page === meta.page}
                  aria-label={`Halaman ${page}`}
                  aria-current={page === meta.page ? "page" : undefined}
                  aria-disabled={isUpdating || undefined}
                  tabIndex={isUpdating ? -1 : 0}
                  onClick={(event) => changePage(event, page)}
                  className={`relative size-9 min-h-9 min-w-9 rounded-md text-sm font-semibold after:absolute after:-inset-1.5 after:rounded-lg after:content-[''] aria-disabled:pointer-events-none aria-disabled:opacity-45 focus-visible:ring-2 focus-visible:ring-primary ${page === meta.page ? activePaginationButtonTheme : paginationButtonTheme}`}
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
              onClick={(event) => changePage(event, meta.page + 1)}
              className={`relative size-9 min-h-9 min-w-9 rounded-md p-0! after:absolute after:-inset-1.5 after:rounded-lg after:content-[''] aria-disabled:pointer-events-none aria-disabled:opacity-45 ${paginationButtonTheme}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
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
