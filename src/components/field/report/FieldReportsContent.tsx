"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { FieldMainPageLayout } from "@/components/layout/FieldMainPageLayout";
import { FieldMainPageTitle } from "@/components/layout/FieldMainPageTitle";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { ServerPagination } from "@/components/ui/ServerPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyReportHistoryQuery } from "@/hooks/report.hooks";
import { useMyReportWorkItemsQuery } from "@/hooks/report-lock.hooks";
import { useAuthStore } from "@/stores/auth.store";
import type { SupervisorReportWorkFilter } from "@/types/api/report-lock.types";
import { FieldReportCard } from "./FieldReportCard";
import { ReportObligationCard } from "./ReportObligationCard";

export function FieldReportsContent() {
  const role = useAuthStore((state) => state.user?.role);
  const isSiteManager = role === "SITE_MANAGER";
  const [activeTab, setActiveTab] = useState<"own" | "team">("own");
  const [filter, setFilter] = useState<SupervisorReportWorkFilter>("ALL");
  const [page, setPage] = useState(1);
  const [teamPage, setTeamPage] = useState(1);
  const workItemsQuery = useMyReportWorkItemsQuery(
    { status: filter, page, pageSize: 10 },
    !isSiteManager || activeTab === "own",
  );
  const teamReportsQuery = useMyReportHistoryQuery(
    {
      scope: "team",
      page: teamPage,
      pageSize: 10,
      sortBy: "submittedAt",
      sortOrder: "desc",
    },
    isSiteManager && activeTab === "team",
  );

  const isTeamTab = isSiteManager && activeTab === "team";
  const isRefreshing = isTeamTab ? teamReportsQuery.isFetching : workItemsQuery.isFetching;

  function refreshList() {
    if (isTeamTab) void teamReportsQuery.refetch();
    else void workItemsQuery.refetch();
  }

  function updateFilter(value: string | null) {
    if (value !== "ALL" && value !== "LATE" && value !== "OVERDUE") return;
    setFilter(value);
    setPage(1);
  }

  const emptyTitle = filter === "LATE"
    ? "Belum ada laporan terlambat"
    : filter === "OVERDUE"
      ? "Belum ada laporan tertunggak"
      : "Tidak ada laporan yang perlu ditindaklanjuti";
  const emptyDescription = filter === "LATE"
    ? "Laporan yang dikirim setelah batas waktu akan muncul di sini."
    : filter === "OVERDUE"
      ? "Kewajiban laporan yang tanggalnya sudah lewat akan muncul di sini."
      : "Kewajiban yang belum dikirim dan laporan terlambat akan muncul di sini.";

  return (
    <FieldMainPageLayout
      headerContent={<FieldMainPageTitle>Laporan</FieldMainPageTitle>}
      overlap="raised"
    >
      <div className="space-y-5">
        <ButtonGroup aria-label="Filter dan segarkan daftar laporan" className="w-full rounded-2xl border border-[var(--project-border)] bg-[var(--project-surface)] p-1 shadow-[var(--project-card-shadow)]">
          <ButtonGroup aria-label="Filter daftar laporan" className="min-w-0 flex-1">
            <Button
              type="button"
              variant="ghost"
              aria-pressed={filter === "ALL"}
              disabled={isTeamTab}
              onClick={() => updateFilter("ALL")}
              className={`h-9 min-w-0 flex-1 rounded-xl px-1 text-[11px] font-semibold min-[380px]:text-xs ${filter === "ALL" ? "bg-[var(--project-action)] text-white shadow-sm hover:bg-[var(--project-action-hover)]" : "text-[var(--project-text-secondary)] hover:bg-[var(--project-canvas)]"}`}
            >
              Semua
            </Button>
            <Button
              type="button"
              variant="ghost"
              aria-pressed={filter === "LATE"}
              disabled={isTeamTab}
              onClick={() => updateFilter("LATE")}
              className={`h-9 min-w-0 flex-1 rounded-xl px-1 text-[11px] font-semibold min-[380px]:text-xs ${filter === "LATE" ? "bg-[var(--project-action)] text-white shadow-sm hover:bg-[var(--project-action-hover)]" : "text-[var(--project-text-secondary)] hover:bg-[var(--project-canvas)]"}`}
            >
              Terlambat
            </Button>
            <Button
              type="button"
              variant="ghost"
              aria-pressed={filter === "OVERDUE"}
              disabled={isTeamTab}
              onClick={() => updateFilter("OVERDUE")}
              className={`h-9 min-w-0 flex-1 rounded-xl px-1 text-[11px] font-semibold min-[380px]:text-xs ${filter === "OVERDUE" ? "bg-[var(--project-action)] text-white shadow-sm hover:bg-[var(--project-action-hover)]" : "text-[var(--project-text-secondary)] hover:bg-[var(--project-canvas)]"}`}
            >
              Tertunggak
            </Button>
          </ButtonGroup>
          <ButtonGroupSeparator className="mx-1 h-8 w-px bg-[var(--project-border)]" />
          <ButtonGroup>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={refreshList}
              disabled={isRefreshing}
              className="size-9 rounded-lg text-[var(--project-action)] hover:bg-[var(--project-canvas)] hover:text-[var(--project-action-hover)]"
              aria-label="Segarkan daftar laporan"
            >
              <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </ButtonGroup>
        </ButtonGroup>

        {isSiteManager && (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value === "team" ? "team" : "own")}>
            <TabsList className="grid w-full grid-cols-2 bg-surface-input">
              <TabsTrigger value="own" className="min-h-12 text-sm font-semibold">Tugas Saya</TabsTrigger>
              <TabsTrigger value="team" className="min-h-12 text-sm font-semibold">Laporan Tim</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {isTeamTab ? (
          <AsyncStateView
            isLoading={teamReportsQuery.isLoading}
            isError={teamReportsQuery.isError}
            error={teamReportsQuery.error}
            data={teamReportsQuery.data}
            isEmpty={(result) => result.data.length === 0}
            onRetry={() => void teamReportsQuery.refetch()}
            loadingFallback={<div className="space-y-3" aria-busy="true" aria-label="Memuat laporan tim"><Skeleton className="h-32 w-full rounded-2xl" /><Skeleton className="h-32 w-full rounded-2xl" /></div>}
            emptyTitle="Belum ada laporan masuk dari tim"
            emptyDescription="Laporan harian yang dikirim Supervisor pada project yang Anda pimpin akan muncul otomatis di sini."
          >
            {(result) => (
              <div className="space-y-4">
                {result.data.map((report) => <FieldReportCard key={report.id} report={report} />)}
                <ServerPagination meta={result.meta} onPageChange={setTeamPage} isUpdating={teamReportsQuery.isPlaceholderData} />
              </div>
            )}
          </AsyncStateView>
        ) : (
          <AsyncStateView
            isLoading={workItemsQuery.isLoading}
            isError={workItemsQuery.isError}
            error={workItemsQuery.error}
            data={workItemsQuery.data}
            isEmpty={(result) => result.data.length === 0}
            onRetry={() => void workItemsQuery.refetch()}
            loadingFallback={<div className="space-y-3" aria-busy="true" aria-label="Memuat daftar laporan"><Skeleton className="h-36 w-full rounded-2xl" /><Skeleton className="h-36 w-full rounded-2xl" /></div>}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
          >
            {(result) => (
              <div className="space-y-3">
                {result.data.map((item) => <ReportObligationCard key={item.id} item={item} />)}
                <ServerPagination meta={result.meta} onPageChange={setPage} isUpdating={workItemsQuery.isPlaceholderData} />
              </div>
            )}
          </AsyncStateView>
        )}
      </div>
    </FieldMainPageLayout>
  );
}
