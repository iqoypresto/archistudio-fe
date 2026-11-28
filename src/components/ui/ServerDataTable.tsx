import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types/api";
import { ServerPagination } from "./ServerPagination";

export interface DataColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

interface ServerDataTableProps<T> {
  columns: DataColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  getRowClassName?: (row: T) => string | undefined;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  isUpdating?: boolean;
  bare?: boolean;
  className?: string;
}

export function ServerDataTable<T>({
  columns,
  data,
  getRowKey,
  getRowClassName,
  meta,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  isUpdating = false,
  bare = false,
  className,
}: ServerDataTableProps<T>) {
  const hasFooter = Boolean(meta && onPageChange && meta.totalItems > 0);

  return (
    <div
      className={cn(
        bare ? "overflow-hidden" : "overflow-hidden rounded-xl border border-border bg-surface",
        className,
      )}
    >
      <div className={cn(bare && "border-t border-border")}>
        <Table className="tabular-nums">
          <TableHeader className="bg-surface-input/50">
            <TableRow className="border-border/80 hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase",
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className={cn(isUpdating && "opacity-65 transition-opacity")}>
            {data.map((row) => (
              <TableRow
                key={getRowKey(row)}
                className={cn(
                  "border-border/60 transition-colors hover:bg-surface-input/40",
                  getRowClassName?.(row),
                )}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-[13px] text-text-primary",
                      column.cellClassName,
                    )}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasFooter && meta && onPageChange && (
        <div className="border-t border-border bg-canvas/30 px-4 py-3 sm:px-5">
          <ServerPagination
            meta={meta}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={pageSizeOptions}
            showSummary
            isUpdating={isUpdating}
          />
        </div>
      )}
    </div>
  );
}
