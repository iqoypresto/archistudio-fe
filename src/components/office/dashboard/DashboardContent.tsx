"use client";

import { useMemo, useState } from "react";
import { AreaUnlockModal } from "@/components/office/dashboard/AreaUnlockModal";
import { DashboardAreaTable } from "@/components/office/dashboard/DashboardAreaTable";
import { DashboardFilterBar } from "@/components/office/dashboard/DashboardFilterBar";
import { DashboardInfoDialog } from "@/components/office/dashboard/DashboardInfoDialog";
import { DashboardKpiCards } from "@/components/office/dashboard/DashboardKpiCards";
import {
  DashboardAreaToolbar, DashboardSupervisorToolbar, type DisciplineTier,
} from "@/components/office/dashboard/DashboardPanelToolbars";
import { PdfExportDialog } from "@/components/office/dashboard/PdfExportDialog";
import { SupervisorLatenessTable } from "@/components/office/dashboard/SupervisorLatenessTable";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { PageHeader } from "@/components/ui/PageHeader";
import { UnderlineTabsBar } from "@/components/ui/UnderlineTabsNav";
import { useDashboardSummary, useSupervisorLateness } from "@/hooks/dashboard.hooks";
import { getTodayInJakarta } from "@/lib/utils/office-format";
import type { DashboardAreaStatusItem, DashboardStatusFilter, SupervisorLatenessItem } from "@/types/api/dashboard.types";

type DashboardTab = "areas" | "supervisors";

function filterAreas(
  areas: DashboardAreaStatusItem[],
  statusFilter: DashboardStatusFilter,
  query: string,
): DashboardAreaStatusItem[] {
  const q = query.trim().toLowerCase();
  return areas.filter((area) => {
    if (statusFilter === "UNREPORTED" && area.status !== "BELUM_LAPOR") return false;
    if (statusFilter === "LATE" && area.status !== "TERLAMBAT") return false;
    if (statusFilter === "OVERDUE_GT_3_DAYS" && !area.isOverdueMoreThan3Days) return false;
    if (!q) return true;
    const text = `${area.areaCode} ${area.areaName} ${area.projectCode} ${area.projectName} ${area.supervisor?.name ?? ""}`.toLowerCase();
    return text.includes(q);
  });
}

function filterSupervisors(
  items: SupervisorLatenessItem[],
  tier: DisciplineTier,
): SupervisorLatenessItem[] {
  if (tier === "GOOD") return items.filter((i) => i.onTimePercentage >= 80);
  if (tier === "LOW") return items.filter((i) => i.onTimePercentage < 60);
  return items;
}

export function DashboardContent() {
  const [projectId, setProjectId] = useState("");
  const [targetDate, setTargetDate] = useState(getTodayInJakarta);
  const [statusFilter, setStatusFilter] = useState<DashboardStatusFilter>("ALL");
  const [areaSearch, setAreaSearch] = useState("");
  const [activeTab, setActiveTab] = useState<DashboardTab>("areas");
  const [tierFilter, setTierFilter] = useState<DisciplineTier>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedUnlockArea, setSelectedUnlockArea] = useState<DashboardAreaStatusItem | null>(null);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState(false);

  const summaryQuery = useDashboardSummary({
    projectId: projectId || undefined,
    date: targetDate || undefined,
  });
  const latenessQuery = useSupervisorLateness(
    {
      projectId: projectId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    { enabled: activeTab === "supervisors" },
  );

  const filteredAreas = useMemo(
    () => filterAreas(summaryQuery.data?.areas ?? [], statusFilter, areaSearch),
    [summaryQuery.data?.areas, statusFilter, areaSearch],
  );
  const filteredSupervisors = useMemo(
    () => filterSupervisors(latenessQuery.data ?? [], tierFilter),
    [latenessQuery.data, tierFilter],
  );

  const handleClickOverdue = () => {
    setActiveTab("areas");
    setStatusFilter("OVERDUE_GT_3_DAYS");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard Monitoring"
        description="Pantau kelengkapan laporan harian per area, status kunci tunggakan, dan kedisiplinan supervisor."
        titleSuffix={<DashboardInfoDialog />}
        action={
          <DashboardFilterBar
            projectId={projectId}
            onProjectChange={setProjectId}
            targetDate={targetDate}
            onTargetDateChange={setTargetDate}
            onOpenExportDialog={() => setIsPdfExportOpen(true)}
          />
        }
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
                  ? "Memperbarui ringkasan pemantauan..."
                  : "Ringkasan belum berhasil diperbarui. Data sebelumnya tetap ditampilkan."}
              </p>
            )}

            <DashboardKpiCards
              metrics={summary.metrics}
              areas={summary.areas}
              onClickOverdue={handleClickOverdue}
            />

            <section className="overflow-hidden rounded-xl border border-border bg-surface">
              <UnderlineTabsBar
                ariaLabel="Tab pemantauan"
                activeValue={activeTab}
                onChange={setActiveTab}
                items={[
                  { value: "areas", label: "Status Area & Pelaporan", count: summary.areas.length },
                  {
                    value: "supervisors",
                    label: "Kedisiplinan Supervisor",
                    count: latenessQuery.data?.length,
                  },
                ]}
              />

              {activeTab === "areas" ? (
                <div>
                  <DashboardAreaToolbar
                    search={areaSearch}
                    onSearchChange={setAreaSearch}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                  />
                  <DashboardAreaTable
                    areas={filteredAreas}
                    onOpenUnlockModal={(area) => setSelectedUnlockArea(area)}
                  />
                </div>
              ) : (
                <div>
                  <DashboardSupervisorToolbar
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onDateFromChange={setDateFrom}
                    onDateToChange={setDateTo}
                    tierFilter={tierFilter}
                    onTierFilterChange={setTierFilter}
                  />
                  <AsyncStateView
                    data={latenessQuery.data}
                    isLoading={latenessQuery.isLoading}
                    isError={latenessQuery.isError}
                    error={latenessQuery.error as Error | null}
                    onRetry={() => latenessQuery.refetch()}
                  >
                    {() => <SupervisorLatenessTable items={filteredSupervisors} />}
                  </AsyncStateView>
                </div>
              )}
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
          defaultDate={targetDate || summaryQuery.data?.targetDate || getTodayInJakarta()}
          onClose={() => setIsPdfExportOpen(false)}
        />
      )}
    </div>
  );
}
