"use client";

import { useEffect, useState } from "react";
import { FieldMainPageLayout } from "@/components/layout/FieldMainPageLayout";
import { FieldMainPageTitle } from "@/components/layout/FieldMainPageTitle";
import { useMyReportHistoryQuery } from "@/hooks/report.hooks";
import type { FieldHistoryFilters } from "./field-history.types";
import { FieldHistoryControls } from "./FieldHistoryControls";
import { FieldHistoryResults } from "./FieldHistoryResults";

const HISTORY_PAGE_SIZE = 10;

export function FieldHistoryContent() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FieldHistoryFilters>({});
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const historyQuery = useMyReportHistoryQuery({
    scope: "own",
    page,
    pageSize: HISTORY_PAGE_SIZE,
    search: search || undefined,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    sortBy: "reportDate",
    sortOrder: filters.sortOrder ?? "desc",
  });

  function applyFilters(nextFilters: FieldHistoryFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function clearSearchAndFilters() {
    setFilters({});
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  return (
    <FieldMainPageLayout
      headerContent={<FieldMainPageTitle>Riwayat Laporan</FieldMainPageTitle>}
      overlap="raised"
    >
      <div className="space-y-5">
        <FieldHistoryControls
          search={searchInput}
          filters={filters}
          onSearchChange={setSearchInput}
          onApplyFilters={applyFilters}
        />
        <FieldHistoryResults
          query={historyQuery}
          filters={filters}
          search={search}
          onPageChange={setPage}
          onClearFilters={clearSearchAndFilters}
        />
      </div>
    </FieldMainPageLayout>
  );
}
