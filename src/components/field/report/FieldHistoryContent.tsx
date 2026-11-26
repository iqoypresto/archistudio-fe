"use client";

import { useMemo, useState } from "react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { FieldMainPageLayout } from "@/components/layout/FieldMainPageLayout";
import { FieldMainPageTitle } from "@/components/layout/FieldMainPageTitle";
import { PageHeader } from "@/components/ui/PageHeader";
import { ServerPagination } from "@/components/ui/ServerPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyReportHistoryQuery } from "@/hooks/report.hooks";
import { useMyAreasStatusQuery } from "@/hooks/report-lock.hooks";
import { useAuthStore } from "@/stores/auth.store";
import type { ListReportsQuery } from "@/types/api/report.types";
import { FieldReportCard } from "./FieldReportCard";

type HistoryFilters = Pick<ListReportsQuery, "projectId" | "areaId" | "dateFrom" | "dateTo">;

export function FieldHistoryContent() {
  const role = useAuthStore((state) => state.user?.role);
  const isSiteManager = role === "SITE_MANAGER";
  const [scopeTab, setScopeTab] = useState<"all" | "own" | "team">("all");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<HistoryFilters>({});
  const areasQuery = useMyAreasStatusQuery();
  const tasks = useMemo(() => areasQuery.data ?? [], [areasQuery.data]);
  const projects = useMemo(() => {
    const byId = new Map(tasks.map((task) => [task.projectId, { id: task.projectId, name: task.projectName }]));
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "id"));
  }, [tasks]);
  const areas = useMemo(() => tasks
    .filter((task) => !filters.projectId || task.projectId === filters.projectId)
    .map((task) => ({ id: task.areaId, projectId: task.projectId, name: task.areaName, code: task.areaCode }))
    .sort((a, b) => a.name.localeCompare(b.name, "id")), [filters.projectId, tasks]);
  const historyQuery = useMyReportHistoryQuery({
    ...filters,
    ...(isSiteManager && scopeTab !== "all" ? { scope: scopeTab } : {}),
    page,
    pageSize: 10,
    sortBy: "submittedAt",
    sortOrder: "desc",
  });
  const hasFilters = Boolean(filters.projectId || filters.areaId || filters.dateFrom || filters.dateTo);

  function updateFilters(patch: Partial<HistoryFilters>) {
    setFilters((current) => ({
      ...current,
      ...patch,
      ...("projectId" in patch ? { areaId: undefined } : {}),
    }));
    setPage(1);
  }

  function resetFilters() {
    setFilters({});
    setPage(1);
  }

  return (
    <FieldMainPageLayout
      headerContent={<FieldMainPageTitle>Riwayat Laporan</FieldMainPageTitle>}
      overlap="raised"
    >
    <div className="space-y-5">
      <PageHeader
        title={isSiteManager ? "Riwayat Laporan" : "Riwayat Saya"}
        hideTitle
        description={
          isSiteManager
            ? "Telusuri riwayat laporan harian Anda maupun laporan tim Supervisor pada project yang Anda pimpin."
            : "Temukan laporan yang sudah Anda kirim berdasarkan project, area, atau tanggal."
        }
      />

      {isSiteManager && (
        <Tabs
          value={scopeTab}
          onValueChange={(val) => {
            setScopeTab(val === "own" || val === "team" ? val : "all");
            setPage(1);
          }}
        >
          <TabsList className="grid w-full grid-cols-3 bg-surface-input">
            <TabsTrigger value="all" className="min-h-12 text-xs font-semibold">Semua</TabsTrigger>
            <TabsTrigger value="own" className="min-h-12 text-xs font-semibold">Milik Saya</TabsTrigger>
            <TabsTrigger value="team" className="min-h-12 text-xs font-semibold">Tim Saya</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <section aria-label="Filter riwayat laporan" className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-text-primary">Filter riwayat</h2>
          {hasFilters && <button type="button" onClick={resetFilters} className="min-h-12 px-2 text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            Hapus filter
          </button>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="history-project" className="text-sm font-medium text-text-secondary">Project</label>
            <Select
              value={filters.projectId ?? "ALL"}
              disabled={areasQuery.isLoading}
              onValueChange={(value: string | null) => updateFilters({ projectId: !value || value === "ALL" ? undefined : value })}
            >
              <SelectTrigger id="history-project" aria-label="Project" className="min-h-12 text-base">
                <SelectValue placeholder="Semua project">{projects.find((project) => project.id === filters.projectId)?.name ?? "Semua project"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua project</SelectItem>
                {projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="history-area" className="text-sm font-medium text-text-secondary">Area</label>
            <Select
              value={filters.areaId ?? "ALL"}
              disabled={areasQuery.isLoading}
              onValueChange={(value: string | null) => updateFilters({ areaId: !value || value === "ALL" ? undefined : value })}
            >
              <SelectTrigger id="history-area" aria-label="Area" className="min-h-12 text-base">
                <SelectValue placeholder="Semua area">{areas.find((area) => area.id === filters.areaId)?.name ?? "Semua area"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua area</SelectItem>
                {areas.map((area) => <SelectItem key={area.id} value={area.id}>{area.code} · {area.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="history-date-from" className="text-sm font-medium text-text-secondary">Dari tanggal</label>
            <Input
              id="history-date-from"
              aria-label="Dari tanggal"
              type="date"
              value={filters.dateFrom ?? ""}
              max={filters.dateTo}
              onChange={(event) => updateFilters({ dateFrom: event.target.value || undefined })}
              className="min-h-12 bg-surface-input text-base"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="history-date-to" className="text-sm font-medium text-text-secondary">Sampai tanggal</label>
            <Input
              id="history-date-to"
              aria-label="Sampai tanggal"
              type="date"
              value={filters.dateTo ?? ""}
              min={filters.dateFrom}
              onChange={(event) => updateFilters({ dateTo: event.target.value || undefined })}
              className="min-h-12 bg-surface-input text-base"
            />
          </div>
        </div>
      </section>

      <AsyncStateView
        isLoading={historyQuery.isLoading}
        isError={historyQuery.isError}
        error={historyQuery.error}
        data={historyQuery.data}
        isEmpty={(res) => res.data.length === 0}
        onRetry={() => { void historyQuery.refetch(); }}
        loadingFallback={
          <div className="space-y-4" aria-busy="true" aria-label="Memuat riwayat laporan">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        }
        emptyTitle={hasFilters ? "Tidak ada laporan yang cocok" : "Belum ada riwayat laporan"}
        emptyDescription={hasFilters ? "Ubah project, area, atau rentang tanggal lalu coba lagi." : "Laporan yang sudah Anda kirim akan muncul di sini."}
      >
        {(res) => (
          <div className="space-y-4">
            {res.data.map((report) => <FieldReportCard key={report.id} report={report} />)}
            <ServerPagination meta={res.meta} onPageChange={setPage} />
          </div>
        )}
      </AsyncStateView>
    </div>
    </FieldMainPageLayout>
  );
}
