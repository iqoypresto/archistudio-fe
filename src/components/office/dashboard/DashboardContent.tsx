"use client";

import { useMemo, useState } from "react";
import { AreaUnlockModal } from "@/components/office/dashboard/AreaUnlockModal";
import { DashboardAreaTable } from "@/components/office/dashboard/DashboardAreaTable";
import { DashboardFilterBar } from "@/components/office/dashboard/DashboardFilterBar";
import { DashboardInfoDialog } from "@/components/office/dashboard/DashboardInfoDialog";
import { DashboardKpiCards } from "@/components/office/dashboard/DashboardKpiCards";
import { PdfExportDialog } from "@/components/office/dashboard/PdfExportDialog";
import { SupervisorLatenessTable } from "@/components/office/dashboard/SupervisorLatenessTable";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardSummary, useSupervisorLateness } from "@/hooks/dashboard.hooks";
import type { DashboardAreaStatusItem, DashboardStatusFilter } from "@/types/api/dashboard.types";

function getTodayInJakarta(): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function filterAreasByStatus(areas: DashboardAreaStatusItem[], filter: DashboardStatusFilter) {
  if (filter === "UNREPORTED") return areas.filter((area) => area.status === "BELUM_LAPOR");
  if (filter === "LATE") return areas.filter((area) => area.status === "TERLAMBAT");
  if (filter === "OVERDUE_GT_3_DAYS") return areas.filter((area) => area.isOverdueMoreThan3Days);
  return areas;
}

export function DashboardContent() {
  const [projectId, setProjectId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<DashboardStatusFilter>("ALL");
  const [activeTab, setActiveTab] = useState("areas");
  const [selectedUnlockArea, setSelectedUnlockArea] = useState<DashboardAreaStatusItem | null>(null);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState(false);

  const summaryQuery = useDashboardSummary({
    projectId: projectId || undefined,
  });

  const latenessQuery = useSupervisorLateness({
    projectId: projectId || undefined,
  }, { enabled: activeTab === "supervisors" });

  const defaultMetrics = useMemo(
    () => ({
      totalProjects: 0,
      activeAreas: 0,
      reportsSubmittedToday: 0,
      areasOverdueMoreThan3Days: 0,
    }),
    [],
  );
  const filteredAreas = useMemo(
    () => filterAreasByStatus(summaryQuery.data?.areas ?? [], statusFilter),
    [summaryQuery.data?.areas, statusFilter],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard Monitoring"
        action={<DashboardInfoDialog />}
      />

      <AsyncStateView
        data={summaryQuery.data}
        isLoading={summaryQuery.isLoading && !summaryQuery.data}
        isError={summaryQuery.isError && !summaryQuery.data}
        error={summaryQuery.error as Error | null}
        onRetry={() => summaryQuery.refetch()}
      >
        {(summary) => (
          <div className="space-y-5">
            {(summaryQuery.isFetching || summaryQuery.isError) && (
              <p role="status" aria-live="polite" className="text-xs text-text-muted">
                {summaryQuery.isFetching
                  ? summaryQuery.isPlaceholderData
                    ? "Memuat ringkasan project terpilih..."
                    : "Memperbarui ringkasan hari ini..."
                  : "Ringkasan belum berhasil diperbarui. Data sebelumnya tetap ditampilkan."}
              </p>
            )}
            <DashboardKpiCards metrics={summary.metrics ?? defaultMetrics} />

            <section className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
              <DashboardFilterBar
                projectId={projectId}
                onProjectChange={setProjectId}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onOpenExportDialog={() => setIsPdfExportOpen(true)}
              />

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(String(value))} className="w-full">
                <TabsList className="mb-3 bg-surface-input">
                  <TabsTrigger value="areas" className="text-xs">
                    Status Area &amp; Pelaporan
                  </TabsTrigger>
                  <TabsTrigger value="supervisors" className="text-xs">
                    Kedisiplinan Supervisor
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="areas" className="space-y-4">
                  <DashboardAreaTable
                    areas={filteredAreas}
                    onOpenUnlockModal={(area) => setSelectedUnlockArea(area)}
                  />
                </TabsContent>

                <TabsContent value="supervisors" className="space-y-4">
                  <AsyncStateView
                    data={latenessQuery.data}
                    isLoading={latenessQuery.isLoading}
                    isError={latenessQuery.isError}
                    error={latenessQuery.error as Error | null}
                    onRetry={() => latenessQuery.refetch()}
                  >
                    {(latenessItems) => <SupervisorLatenessTable items={latenessItems} />}
                  </AsyncStateView>
                </TabsContent>
              </Tabs>
            </section>
          </div>
        )}
      </AsyncStateView>

      <AreaUnlockModal
        isOpen={Boolean(selectedUnlockArea)}
        area={selectedUnlockArea}
        onClose={() => setSelectedUnlockArea(null)}
      />

      {isPdfExportOpen && (
        <PdfExportDialog
          isOpen
          defaultProjectId={projectId}
          defaultDate={summaryQuery.data?.targetDate ?? getTodayInJakarta()}
          onClose={() => setIsPdfExportOpen(false)}
        />
      )}
    </div>
  );
}
